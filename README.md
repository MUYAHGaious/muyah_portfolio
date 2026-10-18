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
fill in `.env`, run `docker compose up -d --build`. Migrations apply themselves
on start, and Caddy handles the certificate.

## Developing

**Backend**

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate   # or source .venv/bin/activate
pip install -r requirements-dev.txt
pytest                                            # 109 tests, no database needed
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

The site is built around a neural network drawn the way an engineer draws one:
a deep navy field, neurons as points, weights as fibres that are cyan when
positive and magenta when negative. The network on the home page is real. It
is a small language-identification model (256 hashed character n-grams, two
tanh layers, eight languages) trained by `backend/app/scripts/train_langid.py`
and run in the visitor's browser by `frontend/src/lib/langid.ts`. Typing a
phrase forward-propagates it through the rendered network and lights up the
path to the answer. The weights file lives at
`frontend/public/models/langid-v1.json`; `node frontend/scripts/check-langid.mjs`
checks the TypeScript forward pass against the Python one.

Type is Archivo for text and JetBrains Mono for readouts (layer names, neuron
ids, counts, status). Dark only. Amber is reserved for the "in build" status.
All motion is opacity and transform plus the WebGL field, and everything
collapses under `prefers-reduced-motion`; without WebGL the classifier still
answers over a still image.

Copy that still needs a fact from the owner carries the literal marker
`[to confirm]`, which renders as an amber flag. Search the site for it before
launch.

### Optional integrations

- **Contact notifications.** Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`,
  `SMTP_FROM` and `CONTACT_TO_EMAIL` in `.env`. Every contact submission is
  stored and, when SMTP is configured, emailed in full with the visitor's
  address as Reply-To. Messages are never lost when mail fails.
- **Meta Pixel.** Set `NEXT_PUBLIC_META_PIXEL_ID` at build time to load the
  Facebook/Meta Pixel. It records page views and a `Lead` event on contact
  submissions so ads can be measured and retargeted. It is off until set, and
  is not loaded for browsers that send Global Privacy Control.

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
