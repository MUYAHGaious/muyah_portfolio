# Design Spec — Portfolio Rebuild (Next.js + FastAPI + Postgres)

**Date:** 2026-08-03
**Status:** Approved

## Problem

The existing site is a Rocket.new/DhiWise-generated template (47 files, ~7,600 lines of Vite + React JSX). Three problems make it unsalvageable rather than fixable:

1. **No backend exists.** `.env` held dummy Supabase/OpenAI/Stripe keys wired to nothing. The contact form validated input and then discarded it. All projects, experience, and testimonials were hardcoded mock arrays.
2. **The content is fabricated.** "5+ years", "TechCorp Solutions, San Francisco", invented testimonials quoting the site owner by name, `github.com/example/*` links, `no_image.png` for every image. Publishing this is actively harmful — it reads as fake because it is.
3. **The design is the default AI-template look** (near-black + `#0066FF` + `#00FFCC`, glow shadows on everything), and it carried real bugs — the hero scroll indicator rendered at `w-[1200px] h-[2000px]`.

## Outcome

A Swiss/minimal portfolio on Next.js (TypeScript, App Router), backed by a FastAPI + Postgres API providing a contact form, an admin CMS, a blog, and self-hosted analytics — running on the owner's VPS via Docker Compose behind Caddy with automatic HTTPS.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend | FastAPI + Postgres | Owner's preference; async, typed, good OpenAPI story |
| Frontend | Next.js 15, TypeScript, App Router | Owner's preference; server components suit content-driven pages |
| Design | Clean minimal / Swiss | Ages well, reads as intentional rather than templated |
| Content | Honest placeholders | No fabricated employers, dates, metrics, or testimonials |
| Admin auth | Password + JWT in httpOnly cookie | Single-owner site; 2FA and OAuth add friction/dependencies without proportional benefit |
| Deployment | Docker Compose + Caddy | Reproducible; Caddy handles TLS with zero config |
| Legacy code | Archived to `legacy/` | Reference for content structure; deleted once the new site is live |
| Sequencing | Build everything, deploy once | Owner's call. Phased delivery was recommended and declined |

## Architecture

```
Browser ──HTTPS──> Caddy ──┬──> web   (Next.js 15, node:22)   :3000
                           └──> api   (FastAPI, python:3.12)  :8000 ──> db (postgres:16)
                                                                  └──> uploads volume
```

Public pages are React Server Components fetching the API over the internal Docker network (`http://api:8000`) with `revalidate`. Admin pages are client components calling `/api/*` through Caddy, so the JWT cookie stays same-origin. Postgres is never published to the host; only Caddy binds 80/443.

## Data model

Eight tables: `admin_user`, `project`, `experience`, `post`, `message`, `media`, `page_view`, `site_settings`.

Shapes derive from the legacy mock data, flattened — the legacy nesting (per-experience testimonials, per-technology proficiency levels) was template filler.

`tech[]`, `tags[]`, and `highlights` are JSONB rather than join tables. These are display-only lists on a single-author site; normalizing costs three tables and buys nothing until a query like "all projects using React" is required, which it is not.

## Security

- **Auth:** bcrypt password hash. Admin seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` on first startup only (idempotent). JWT HS256, 7-day expiry, in an `httpOnly` + `secure` + `samesite=lax` cookie. Login limited to 5 attempts per 15 minutes per IP.
- **Contact spam:** hidden honeypot field, minimum time-on-form, 3 submissions per hour per IP. No third-party CAPTCHA — avoids an external dependency and a privacy footgun. If SMTP fails the message is still persisted and the endpoint returns success; mail delivery must never lose a lead.
- **Analytics privacy:** no cookies, no third parties, no raw IPs stored. `visitor_hash = sha256(ip + user_agent + daily_rotating_salt)` yields a unique-visitor count that becomes un-linkable after 24 hours.
- **Uploads:** extension and magic-byte validation, 5 MB cap, EXIF stripped, re-encoded to WebP at three widths.
- **CORS:** locked to the site origin.

## Design system

- **Palette:** `--paper #FAFAF9`, `--ink #111111`, `--muted #6B6B6B`, `--rule #E5E5E3`, one accent `--signal #1D4ED8` reserved for links and focus rings. Dark mode inverts.
- **Type:** Inter Variable and JetBrains Mono, self-hosted via `next/font` — the legacy CSS had two render-blocking Google Fonts `@import`s. Mono is reserved for years, indices, and metadata.
- **Layout:** strict 12-column grid, 1200px max width. Hairline 1px rules as the primary structural device — no cards, shadows, gradients, or glow.
- **Motion:** opacity and transform only, ≤200ms, all wrapped in `prefers-reduced-motion`. `framer-motion` is dropped.
- **Accessibility:** WCAG AA contrast, visible focus rings, semantic landmarks, full keyboard navigation including the admin panel.

## Out of scope

Comments, newsletter, multi-user accounts or roles, i18n, payments. The unused legacy dependencies (`@dhiwise/component-tagger`, `d3`, `recharts`, `redux`, `socket.io`, `react-helmet`) do not carry over.

## Verification

See the "Verification" section of the implementation plan: backend `pytest`, frontend typecheck + Playwright smoke, a clean `docker compose up -d --build` integration pass, and Lighthouse ≥95 on performance and accessibility.
