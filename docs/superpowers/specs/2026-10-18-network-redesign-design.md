# muyah.dev redesign: "The Network"

## Context

The current site at muyah.dev (Next.js 15 + FastAPI CMS, warm cream/orange, CSS-only motion, no 3D) presents Muyah as a "full-stack engineer still finishing a degree". That is out of date. Muyah is now **AI Department Lead at Skye8** (whole department reports to them), **B.Eng Computer Engineering, NAHPI** (graduated), **M.Eng in progress at NAHPI**, and led the AI work on **Malegado** (chatbots, real-time voice talk-back, text-to-text and text-to-speech pipeline across all 590 supported languages, still growing) and **Scholar AI** (AI learning assistant: LMS, AI tutor, school management; in build, not public yet).

Muyah's brief, in their words: the UI must be "out of this world", something "a senior dev wouldn't even be able to do", like "a simulation of a neural network with billions of parameters". They supplied a reference screenshot: a dark navy screen, a fully-connected MLP drawn honestly, labelled input neurons with live activation values on the left, hidden neurons `H1_1 … H1_42` down the middle, thousands of weight fibers in cyan and magenta. They picked "watch a model think" (Bycroft's LLM viz) as the closest feeling, and asked me to make the design decisions.

Audience: hiring managers, clients, peers. Three deliverables: (1) new UI/UX, (2) new content telling the true story, (3) GitHub profile brought in line.

Research basis (summarised): award juries and hiring guides agree on fewer, deeper case studies with problem/role/method/outcome; engineering signals (serving, tests, latency, evaluation) over notebooks; one live or runnable demo; dark + restrained motion at 60fps on mid-range mobile; reduced-motion fallback. The standout AI visuals online are Bycroft's 3D transformer walkthrough and GPU particle/fiber fields. Nobody combines an honest, *running* model with the portfolio itself. That is the gap this design fills.

## The design decision

**Concept: the model is the website.** The home page is built around a real neural network that runs in the visitor's browser and is drawn exactly like the reference: labelled layers, every weight a fiber (cyan = positive, magenta = negative, brightness = magnitude), activation numbers ticking live. It is not decoration. It is a small **language-identification MLP** trained by us offline on character n-grams of short phrases in a handful of languages Malegado covers (Hausa, Yoruba, Swahili, Igbo, Amharic, French, English, Spanish). The visitor types a word or phrase in the hero; it is encoded, forward-propagated through the visible network, the fibers light up along the active path, and the output layer resolves to a language. Honest, on-brand (590 languages), and demonstrably real.

Why this and not Bruno-Simon-style 3D or pure particles: it is the only option that is simultaneously (a) visually what Muyah pointed at, (b) truthful about what an AI lead does, (c) interactive proof rather than a video, and (d) buildable with a hard performance budget.

**Visual system** (dark only; the cream light theme is retired):
- Ground `#060a18` → `#0b1230` gradient; surface `#0f172f`; line `#1c2750`.
- Accents: cyan `#22d3ee` (positive weight / primary), magenta `#e040fb` (negative weight / secondary), signal white `#e6ecff`, muted `#8b97c2`. Amber `#ffd166` reserved for "in build" status only.
- Type: a tight grotesk display for headlines + **JetBrains Mono** for labels, numbers, activation readouts, neuron ids (matches the `H1_12` labels in the reference). Both self-hosted woff2 in `frontend/src/fonts/` (repo rule: no font CDN).
- Motion: scroll reveals via existing `Reveal`; fibers and activations are the only heavy motion; everything collapses under `prefers-reduced-motion`; no page-transition theatre.
- Grid: 12-col shell, generous whitespace, monospace "readout" strips between sections (`layer: projects · 06 nodes · status: live`).

**Home page order**
1. **Hero / NeuralField**: full-bleed network canvas; left overlay: `AI engineer. Department lead. Still shipping code every week.`; sub-line with Skye8, NAHPI; input box "Type a word in any language…" wired to the model; output chip shows predicted language + confidence; buttons Work / GitHub / Contact.
2. **Readout strip**: honest stats. `590+ languages in the Malegado pipeline` · `AI Department Lead, Skye8` · `B.Eng → M.Eng, NAHPI` · `N open-source repos`. No invented metrics.
3. **Flagship: Malegado**: case-study card with the **talk-back replay demo** (scripted, pre-recorded exchange, waveform, STT→LLM→TTS stage indicator, latency readout labelled "representative"). Link to full case study.
4. **Flagship: Scholar AI**: card marked `in build` (amber), architecture sketch (LMS + tutor + school admin), no fake screenshots.
5. **Work grid**: muyah-code, Kodschul, IziShop, student predictor, others from CMS.
6. **Leading the department**: short block on team, responsibilities, interns supervised, link to About.
7. **Writing** (3 latest) → **Contact**.

**Case study template** (`/work/[slug]`): header `YEAR · TITLE · ROLE`; TL;DR (3 lines); Problem → My role & decisions → Method (pipeline diagram component) → Outcome; Model-card block (data, training, eval, limitations, serving) where applicable; "What I'd watch in production"; links. Unknown facts get a visible `[to confirm]` marker in the seed content, never a made-up number.

**About page**: lead with the role and what reporting-to-you means; education (NAHPI B.Eng, M.Eng in progress); timeline from CMS experience; the icon cloud is dropped (template feel).

## Implementation plan

### Phase 0: branch and spec
- Branch `redesign/network`. Save this plan's design section as `docs/superpowers/specs/2026-10-18-network-redesign-design.md` (the repo already keeps specs there).
- Add `.superpowers/` to `.gitignore` (done locally, uncommitted).

### Phase 1: design system
- `frontend/src/app/globals.css`: replace token set with the dark system above; keep utility names (`shell`, `panel`, `card`, `eyebrow`, `animate-*`) so existing components keep working; add `.readout` (mono strip) and `.status-build`.
- `frontend/src/app/layout.tsx`: load the two new fonts via `next/font/local`; default `data-theme="dark"`; remove light theme + `ThemeToggle.tsx` usage (keep the file deleted, update `e2e/smoke.spec.ts` theme test).
- `SiteBackground.tsx`: replace vermilion rings with a faint static fiber texture (CSS/SVG), so inner pages echo the hero cheaply.
- Header/footer/bottom-nav restyle only; no structural change.

### Phase 2: the model (offline)
- `backend/app/scripts/train_langid.py` (new, Python, numpy only): char-bigram hashing (128 buckets) → MLP 128 → 64 → 42 → 8, tanh/softmax, trained on a small bundled phrase list per language (`backend/app/scripts/langid_data/*.txt`, ~200 phrases each, sourced/written by us; Muyah can extend). Exports `frontend/public/models/langid-v1.json` (weights, biases, vocab hashing seed, labels, accuracy on held-out split). ~12k weights.
- Hidden layer sizes chosen to match the reference density (42 neurons labelled `H1_1..H1_42` style) while keeping fibers ≈ 11k lines.

### Phase 3: NeuralField renderer
- Add `three` (+ `@types/three`); no react-three-fiber (keep bundle small, one imperative component).
- `frontend/src/components/network/NeuralField.tsx` (client, dynamic import, `ssr:false`):
  - One `THREE.LineSegments` for all fibers with per-vertex color/alpha from weight sign/magnitude; one `InstancedMesh` for neurons; labels (`in_07`, `H1_12`, `out: Hausa`) as a sprite atlas or CSS2D for the visible subset.
  - `forward(input)` in `frontend/src/lib/langid.ts` (pure TS, mirrors training math); activations drive neuron brightness and a travelling pulse along fibers over ~900ms.
  - Idle state: slow breathing + periodic auto-demo cycling through sample phrases so the page is alive without input.
  - Camera: slight parallax on pointer; mobile: fixed.
  - Budgets: ≤ 1 draw call for fibers, ≤ 3 total; target 60fps on a mid Android; `requestIdleCallback` init; canvas capped at DPR 1.5.
  - Fallbacks: no WebGL2 or `prefers-reduced-motion` → static pre-rendered PNG of the network + still-working text classifier output (the TS forward pass needs no GPU).
- `frontend/src/components/network/LangInput.tsx`: input + output chip + "how this works" popover (one paragraph, honest: tiny model, 8 languages, trained on N phrases, accuracy X%).

### Phase 4: home page sections
- `components/home/Hero.tsx` rewritten around NeuralField + LangInput (reads `settings.name/tagline/socials` as before).
- New `components/home/ReadoutStrip.tsx` (stats from settings + a new `settings.stats` list).
- New `components/home/FlagshipCard.tsx` used twice (Malegado, Scholar AI), driven by new project fields.
- New `components/demo/TalkbackReplay.tsx`: scripted exchange JSON (`frontend/public/demos/talkback-hausa.json`), CSS waveform, stage indicator, labelled as a representative replay.
- Keep `ProjectGrid`, `SectionHeading`, `Reveal`, `Parallax`; retire `FeaturedSlider`, `BentoGrid`, `Testimonials` (empty anyway), `WeatherBadge`, `MiniCalendar`, `interactive-icon-cloud`, `vermilion-rings`, `animated-letter-text`, `dock` (replace with plain nav). Delete `legacy/` (README already says safe to delete).

### Phase 5: CMS schema + content
- Migration `backend/alembic/versions/0003_project_showcase_fields.py`: on `projects` add `status` (`live|in_build|archived`, default `live`), `featured` (bool), `tldr` (text), `metrics` (JSON list of `{label, value, note}`), `team_size` (int, nullable), `highlight` (short string). On `site_settings` add `title` (role line), `stats` (JSON list), `education` (JSON list). Update `backend/app/models/project.py`, `settings.py`, `schemas/content.py`, admin routers, `frontend/src/lib/types.ts`, admin project/settings forms (`frontend/src/app/admin/projects/[id]/page.tsx`, `admin/settings/page.tsx`).
- Rewrite `backend/app/scripts/seed_content.py`: settings (title "AI Engineer · AI Department Lead, Skye8", tagline, bio, education, stats), experience (Skye8: Backend Dev 2024 → Data Scientist 2025 → AI Engineer → AI Department Lead; dates `[to confirm]`), projects: Malegado (featured, live), Scholar AI (featured, in_build), muyah-code, Kodschul, IziShop, student predictor, keep tease; services reworded for an AI lead (AI product delivery, model training & deployment, technical leadership/advisory). Case-study bodies written from facts gathered; pipeline sections described generically where base models are unknown, marked `[to confirm: base model]`.
- Tests: extend `backend/tests/test_admin_content.py` and `test_public.py` for new fields; update README test count.

### Phase 6: inner pages
- `/work`: drop `WorkShowcase` accordion; featured first, then grid with status chips.
- `/work/[slug]`: new template per design; `components/casestudy/PipelineDiagram.tsx` (SVG stages from a `pipeline` array in body front-matter or a new `pipeline` JSON field; decide at build, prefer JSON field added in the same migration).
- `/about`: role, department, education, timeline. `/services`, `/writing`, `/contact`: restyle only.
- `opengraph-image.tsx`: regenerate with the network motif.

### Phase 7: GitHub
- Create/refresh profile repo `MUYAHGaious/MUYAHGaious` README: one-screen story (role, Skye8, NAHPI, Malegado, Scholar AI in build, muyah-code), links to muyah.dev and LinkedIn. Bio: "AI Engineer · AI Department Lead @ Skye8 · M.Eng NAHPI". Pin order: muyah-code, kodschul-seminar-management, student-performance-predication, izishop-backend, plus the langid demo repo if we publish it. Add a short header + link back to the case study on each pinned repo README.
- Mechanics: `gh` CLI if authenticated (the GitHub MCP server failed to connect this session); otherwise prepare the files and give Muyah the exact steps. Pinning has no CLI; done via GraphQL `pinRepositories` mutation with `gh api`, or manually.

### Phase 8: verification and deploy
- `cd frontend && npm run typecheck && npm run lint && npm run build`; `cd backend && pytest`.
- Run stack locally (`docker compose up`), seed, `npm run test:e2e` (update smoke tests: theme test removed, hero input test added: type "ina kwana" → output chip shows Hausa).
- Lighthouse mobile on `/`: LCP < 2.5s, CLS < 0.1, INP < 200ms; check `prefers-reduced-motion` fallback renders; check WebGL-off fallback (Chrome flag).
- Deploy per `DEPLOY-VPS.md` (pull, `docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d --build`, run migration + `seed_content --force`, nginx `reload`). Tease on the same box is untouched (separate ports 8010/subdomains).

## Facts still needed from Muyah (non-blocking; seeded with `[to confirm]`)
- Base models / architectures fine-tuned for Malegado TTS and text models; team size; dates of each Skye8 role and the promotion.
- Scholar AI: any detail beyond "LMS + AI tutor + school management, in build".
- A headshot and current CV PDF (uploaded via admin).
- LinkedIn URL; whether to publish the lang-id training repo publicly.

## Out of scope
- Real live LLM/voice inference against a paid API (replay demo instead, by Muyah's choice).
- Changes to the tease project or shared nginx beyond a reload.
