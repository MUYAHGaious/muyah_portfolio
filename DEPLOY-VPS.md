# Deploying muyah.dev to the Contabo VPS

This box is shared. Twelve other sites run on it behind a single nginx, and the
standalone instructions in [DEPLOY.md](DEPLOY.md) — where this stack's own Caddy
owns ports 80 and 443 — would fight it. Follow this file instead.

## What is already on the machine

```
nginx           active, owns :80 and :443, certbot with webroot /var/www/certbot
docker          system-wide, angwe is in the docker group
postgres 16     native on 127.0.0.1:5432 (not used by this stack)
```

Loopback ports already taken: `3001 3002 3003 4310 8000 8001 8002 8003 8004`,
plus `9090`/`9443`. This site uses **3004** (web) and **8005** (api).

Each site here runs its own Postgres container rather than sharing the host
instance. This stack follows that pattern — the `db` service is unchanged.

## Prerequisites

1. **DNS.** `muyah.dev` and `www.muyah.dev` must both have `A` records pointing
   at `161.97.162.79` *before* you request a certificate. Leave the `MX` records
   on Hostinger alone — mail is routed by MX and is unaffected.

   Confirm from any machine:
   ```
   dig +short muyah.dev        # expect 161.97.162.79
   ```

2. **Sudo.** Installing the nginx site and running certbot need root.

## Deploy

```bash
ssh vps
mkdir -p ~/sites/muyah.dev && cd ~/sites/muyah.dev
git clone https://github.com/MUYAHGaious/muyah_portfolio.git .
```

Create `.env` (see `.env.example` for the full list) and lock it down:

```bash
chmod 600 .env
```

The uploads directory is a host folder, not a Docker volume, so nginx can serve
it directly. It must be owned by uid **10001** — the unprivileged user inside
the API container — or every upload fails with a permission error:

```bash
mkdir -p uploads
sudo chown 10001:10001 uploads
sudo chmod 755 uploads          # nginx needs to read it
```

Bring the stack up. Migrations run from the container entrypoint, so there is no
separate `alembic upgrade` step:

```bash
docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.vps.yml ps
```

Verify it is answering on loopback before involving nginx:

```bash
curl -s localhost:8005/api/health     # {"status":"ok"}
curl -sI localhost:3004 | head -1     # HTTP/1.1 200 OK
```

## nginx and the certificate

These steps must run in this order. The full site file names certificate paths
that do not exist yet, so `nginx -t` would fail if it were installed first — but
certbot's webroot challenge needs nginx to already answer on port 80 for this
hostname, or the challenge 404s against the default server. The bootstrap vhost
exists to break that cycle.

**1. Install the bootstrap vhost and reload:**

```bash
sudo cp deploy/nginx/muyah.dev.bootstrap.conf /etc/nginx/sites-available/muyah.dev
sudo ln -sf /etc/nginx/sites-available/muyah.dev /etc/nginx/sites-enabled/muyah.dev
sudo nginx -t && sudo systemctl reload nginx
```

**2. Obtain the certificate**, using the webroot the other sites already use:

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d muyah.dev -d www.muyah.dev
```

**3. Swap in the real site file and reload:**

```bash
sudo cp deploy/nginx/muyah.dev.conf /etc/nginx/sites-available/muyah.dev
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` must pass before the reload. A reload with a broken config is
refused, but a *restart* would take all twelve sites down — never use restart
here.

## Seed the content

```bash
docker compose -f docker-compose.yml -f docker-compose.vps.yml exec api \
  python -m app.scripts.seed_content
```

Then log in at `https://muyah.dev/admin` with the `ADMIN_EMAIL` and
`ADMIN_PASSWORD` from `.env`, and change the password from `/admin/settings`.

## Updating

```bash
cd ~/sites/muyah.dev
git pull
docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d --build
```

nginx is untouched by an update. Only re-run the nginx steps if
`deploy/nginx/muyah.dev.conf` itself changed.

## Backups

Two things hold state — the database and the uploads folder:

```bash
docker compose -f docker-compose.yml -f docker-compose.vps.yml exec -T db \
  pg_dump -U portfolio portfolio | gzip > ~/backups/muyah-$(date +%F).sql.gz
tar czf ~/backups/muyah-uploads-$(date +%F).tar.gz -C ~/sites/muyah.dev uploads
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `502 Bad Gateway` | nothing on 3004/8005 | `docker compose ... ps`, then `logs web` / `logs api` |
| certbot fails | DNS not propagated | `dig +short muyah.dev` must return `161.97.162.79` |
| Uploads return 403 | `uploads/` not readable by nginx | `sudo chmod 755 uploads` |
| Uploads fail to save | `uploads/` not owned by 10001 | `sudo chown 10001:10001 uploads` |
| Admin login does not persist | `X-Forwarded-Proto` missing | it is in the site file — check nginx actually reloaded |
| Pages render empty | api unreachable from web | both are on the compose network; check `logs api` |
