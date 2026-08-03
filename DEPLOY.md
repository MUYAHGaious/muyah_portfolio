# Deploying to your VPS

The whole stack runs from one `docker compose up`. Caddy handles HTTPS
certificates automatically — there is no certbot step and nothing to renew.

## What you need

- A VPS with Docker and the Compose plugin (`docker compose version` should work)
- A domain, with an **A record pointing at your server's IP**
- Ports 80 and 443 open

## 1. Point the domain at the server

In your DNS provider, add an A record:

```
Type   Name    Value
A      @       <your server's IP>
A      www     <your server's IP>     (optional)
```

Confirm it resolves before continuing — Caddy cannot issue a certificate until
it does:

```bash
dig +short yourdomain.com
```

## 2. Get the code onto the server

```bash
git clone <your repo url> portfolio
cd portfolio
```

## 3. Configure

```bash
cp .env.example .env
```

Open `.env` and fill in every empty value. Generate the secrets rather than
inventing them:

```bash
openssl rand -hex 24      # POSTGRES_PASSWORD  (hex, not base64 — see below)
openssl rand -hex 32      # SECRET_KEY
openssl rand -base64 18   # ADMIN_PASSWORD
```

`POSTGRES_PASSWORD` must be hex. It gets interpolated into a database
connection URL, and the `+` and `/` characters that `base64` produces would
corrupt it. `ADMIN_PASSWORD` is never part of a URL, so base64 is fine there.

Set `DOMAIN` to your domain **without** `https://` or a trailing slash.

## 4. Start it

```bash
docker compose up -d --build
```

The first build takes a few minutes. Watch it come up:

```bash
docker compose ps
docker compose logs -f caddy
```

## 5. Create the database tables

```bash
docker compose exec api alembic upgrade head
```

Optionally add placeholder content so the site isn't blank while you fill it in:

```bash
docker compose exec api python -m app.scripts.seed_content
```

## 6. Sign in and change your password

Go to `https://yourdomain.com/admin`, sign in with `ADMIN_EMAIL` and
`ADMIN_PASSWORD`, then **change your password immediately** under Settings. The
value in `.env` is only used to create the account; changing it there later does
nothing.

Then fill in Settings, add your real projects, and delete the placeholders.

---

## Updating the site

```bash
git pull
docker compose up -d --build
docker compose exec api alembic upgrade head   # only if migrations changed
```

## Email for the contact form

The contact form works without email — messages are always stored and readable
at `/admin/messages`. Configuring SMTP just adds a notification.

Any SMTP provider works. Fill in the `SMTP_*` values in `.env`, then
`docker compose up -d api`. If the mail server is unreachable the message is
still saved and the visitor still sees a success message, by design.

## Backups

Everything that matters lives in two Docker volumes: `pgdata` (the database) and
`uploads` (your images and CV).

```bash
# Database
docker compose exec -T db pg_dump -U portfolio portfolio | gzip > backup-$(date +%F).sql.gz

# Uploaded files
docker run --rm -v muyah-portfolio_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Restoring the database:

```bash
gunzip -c backup-2026-08-03.sql.gz | docker compose exec -T db psql -U portfolio portfolio
```

## Troubleshooting

**Caddy won't get a certificate.** Almost always DNS. Check `dig +short
yourdomain.com` returns your server's IP, and that ports 80 and 443 are open
(`sudo ufw allow 80,443/tcp`). Let's Encrypt has rate limits, so avoid
restarting repeatedly while debugging — `docker compose logs caddy` will say
which it is.

**`502 Bad Gateway`.** The `web` or `api` container isn't healthy yet.
`docker compose ps` shows status; `docker compose logs api` shows why.

**The site loads but has no content.** The migration probably hasn't run:
`docker compose exec api alembic upgrade head`.

**Can't sign in.** The admin account is created on the API's *first* start. If
you changed `ADMIN_PASSWORD` after that, it had no effect. To reset, exec into
the API container and update the password hash, or drop the `admin_user` row and
restart `api` to have it reseeded from `.env`.

## Running locally

```bash
cp .env.example .env      # DOMAIN=localhost is fine
docker compose up -d --build
docker compose exec api alembic upgrade head
```

Caddy issues a local certificate for `localhost`; your browser will warn about
it, which is expected.

For frontend development with hot reload, run the app directly instead:

```bash
docker compose up -d db api          # backend on :8000
cd frontend && npm install && npm run dev   # site on :3000
```

`next.config.ts` proxies `/api` and `/uploads` to `localhost:8000` in this mode.
