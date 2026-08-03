# Portfolio

A portfolio site with a self-hosted backend: Next.js on the front, FastAPI and
Postgres behind it, all running from one `docker compose up` with automatic
HTTPS.

Nothing here depends on a third-party service. No CMS account, no analytics
provider, no font CDN, no email SaaS required.

## What it does

- **Public site** — home, work index and case studies, about with an experience
  timeline, writing, contact form
- **Admin panel** at `/admin` — edit everything on the site without a redeploy
- **Contact form** — stores every message and emails you; still stores them if
  the mail server is down
- **Writing** — Markdown posts with drafts and tags
- **Analytics** — self-hosted, cookieless, no raw IPs stored

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind v4 |
| Backend | FastAPI, SQLAlchemy 2 (async), Alembic, Pydantic v2 |
| Database | Postgres 16 |
| Proxy | Caddy — automatic TLS, no certbot |

## Deploying

See **[DEPLOY.md](DEPLOY.md)**. Short version: point a domain at your server,
fill in `.env`, run `docker compose up -d --build`, then
`docker compose exec api alembic upgrade head`.

## Developing

**Backend**

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate   # or source .venv/bin/activate
pip install -r requirements-dev.txt
pytest                                            # 85 tests, no database needed
uvicorn app.main:app --reload
```

The test suite runs against in-memory SQLite so it needs no running server. No
query uses a Postgres-specific operator, which is what makes that substitution
safe; the same suite runs against real Postgres in the container during
integration checks.

**Frontend**

```bash
cd frontend
npm install
npm run dev          # proxies /api and /uploads to localhost:8000
npm run typecheck
npm run build
```

**End-to-end**

```bash
cd frontend
npx playwright install chromium
BASE_URL=http://localhost:3000 npm run test:e2e
```

## Layout

```
backend/    FastAPI app, models, migrations, tests
frontend/   Next.js app, design system, admin panel
legacy/     The previous Vite template. Reference only — safe to delete.
docs/       Design spec
```

## Design

Swiss/International Typographic Style: one grotesque (Archivo) at several
weights rather than a display/body pair, a pure white ground, hairline rules as
the only structural device, and red used exclusively for functional signals —
current state, focus, links on hover. If red appears, it means something.

The work index is set as a typographic table keyed by year, with a hover
preview, rather than the usual card grid. Dark mode inverts the palette. All
motion is opacity and transform only, and disabled under
`prefers-reduced-motion`.

## Security notes

- Admin sessions are JWTs in `httpOnly`, `secure`, `samesite=lax` cookies;
  passwords are bcrypt-hashed and login is rate limited per IP.
- Uploads are validated by decoding them, not by trusting the extension or the
  content type. EXIF (including GPS) is stripped on re-encode.
- Analytics stores `sha256(ip + user-agent + a salt that rotates daily)`, so
  views stop being linkable after 24 hours. Raw IPs are never written.
- Postgres is not published to the host; only Caddy binds 80 and 443.
- Markdown is rendered without raw HTML, so a compromised admin account cannot
  turn stored content into stored XSS.
