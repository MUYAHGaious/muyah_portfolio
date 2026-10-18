"""Populate the database with Muyah's real content.

Everything here is a fact Muyah has stated or that is on the public record
(GitHub, app stores, Skye8). Where a specific is still missing it is written
as the literal marker ``[to confirm]`` so it is visible on the page and cannot
be mistaken for a claim. Fill those in from /admin and the marker disappears.

Run with:  python -m app.scripts.seed_content
Existing rows are left untouched; pass --force to replace them.
"""

import argparse
import asyncio
from datetime import date

from sqlalchemy import delete, func, select

from app.core.db import SessionFactory
from app.models import Experience, Post, Project, Service, Testimonial
from app.services.seed import ensure_admin_user, ensure_site_settings

GITHUB = "https://github.com/MUYAHGaious"
LINKEDIN = "https://linkedin.com/in/muyah-gaious-angwe-1b5976254"
TO_CONFIRM = "[to confirm]"

PROJECTS = [
    {
        "slug": "malegado",
        "title": "Malegado",
        "status": "live",
        "featured": True,
        "year": 2026,
        "role": "AI lead: models, pipeline, voice",
        "category": "ai",
        "team_size": None,
        "highlight": "Real-time voice conversation in 590 languages",
        "summary": (
            "Language and culture learning app. I trained the text and speech models and "
            "built the chatbots and the live voice talk-back behind every one of its 590 "
            "languages."
        ),
        "tldr": (
            "Malegado teaches languages most AI products ignore. I built the AI inside it: "
            "text-to-text models for conversation and lessons, text-to-speech voices, and a "
            "streaming talk-back loop so a learner can speak and be answered out loud. The "
            "pipeline covers all 590 supported languages and new ones are still being added."
        ),
        "tech": [
            "PyTorch",
            "Text-to-speech",
            "Speech-to-text",
            "Streaming inference",
            "FastAPI",
            "Mobile",
        ],
        "links": {
            "live": "https://malegado.com",
            "app_store": "https://apps.apple.com/vn/app/malegado/id6760017663",
            "play_store": "https://play.google.com/store/apps/details?id=com.corealpha.malegado",
        },
        "metrics": [
            {
                "label": "languages supported",
                "value": "590+",
                "note": "all through one training and serving pipeline",
            },
            {
                "label": "talk-back round trip",
                "value": f"{TO_CONFIRM} ms",
                "note": "speech in to speech out, representative",
            },
            {
                "label": "model families",
                "value": "2",
                "note": "text-to-text and text-to-speech",
            },
        ],
        "pipeline": [
            {
                "stage": "Collect",
                "detail": (
                    "Phrase, lesson and recorded-speech data per language. Many are "
                    "low-resource, with little clean text anywhere online."
                ),
            },
            {
                "stage": "Clean and align",
                "detail": (
                    "Normalise scripts, tones and diacritics. Align audio to text so the "
                    "speech models learn from matched pairs."
                ),
            },
            {
                "stage": "Tokenise",
                "detail": (
                    f"{TO_CONFIRM}: tokeniser. Shared across scripts so one model family "
                    "covers hundreds of languages."
                ),
            },
            {
                "stage": "Train",
                "detail": (
                    "Fine-tune text-to-text models for conversation and lesson generation. "
                    f"Train text-to-speech voices. {TO_CONFIRM}: base models."
                ),
            },
            {
                "stage": "Evaluate",
                "detail": (
                    "Held-out sets per language. Native-speaker review for how natural the "
                    "speech sounds."
                ),
            },
            {
                "stage": "Serve",
                "detail": (
                    "Streaming speech-to-text, text model, text-to-speech loop, tuned for a "
                    "conversational round trip on a phone."
                ),
            },
        ],
        "sort_order": 10,
        "published": True,
        "body_md": (
            "## The problem\n\n"
            "Malegado teaches Hausa, Yoruba, Swahili, Igbo, Amharic, Kikuyu and hundreds "
            "more alongside French, Spanish and English. For most of those languages there "
            "is no commercial voice AI to buy and very little clean data to train on. If the "
            "app was going to talk back to a learner, we had to build the models ourselves.\n\n"
            "## My role\n\n"
            "I led the AI work. I trained the text-to-text models that power the chatbots "
            "and lesson generation, trained the text-to-speech voices, and built the "
            "real-time talk-back feature, where a learner speaks and the app answers out "
            "loud in the language they are studying. The AI department that now reports to "
            "me maintains the pipeline and keeps adding languages.\n\n"
            "## The pipeline\n\n"
            "Every one of the 590 supported languages goes through the same six stages. We "
            "collect phrases, lessons and recorded speech. We clean and normalise scripts, "
            "tones and diacritics, and align audio to text. A shared tokeniser lets one "
            f"model family cover many scripts ({TO_CONFIRM}: which tokeniser). We fine-tune "
            f"the text models and train the voices ({TO_CONFIRM}: base models), evaluate on "
            "held-out sets per language with native speakers reviewing the speech, and "
            "serve everything behind a streaming API the mobile app calls.\n\n"
            "The reason it is one pipeline and not 590 projects is scale. A new language is "
            "a new dataset dropped into the same stages, not a new engineering effort.\n\n"
            "## Talk-back, how it works\n\n"
            "The learner speaks. Speech-to-text turns that into text while they are still "
            "talking. The text model drafts a reply in the target language, and "
            "text-to-speech starts voicing the reply before the whole sentence is finished. "
            "Each stage streams into the next, so the pause before the app answers is short "
            "enough to feel like a conversation rather than a form submission. "
            f"Representative round trip: {TO_CONFIRM} ms.\n\n"
            "The hard part is not the loop, it is the voices. A text-to-speech model for a "
            "tonal, low-resource language has to get tone right from very little audio, or "
            "it teaches the learner the wrong word. That is where most of the evaluation "
            "effort went.\n\n"
            "## What I watch in production\n\n"
            "Per-language quality, because a regression in one small language is invisible "
            "in the averages. Latency percentiles for the talk-back loop, not the mean. And "
            "data growth per language, which tells us which voices are due for retraining.\n\n"
            "## Status\n\n"
            "Live on iOS and Android. Languages are still being added."
        ),
    },
    {
        "slug": "scholar-ai",
        "title": "Scholar AI",
        "status": "live",
        "featured": True,
        "year": 2026,
        "role": "AI lead",
        "category": "ai",
        "team_size": None,
        "highlight": "An AI tutor, LMS and school system in one",
        "summary": (
            "AI-oriented learning assistant for students: learning management, an AI tutor, "
            "and school administration in one system. Being built at Skye8."
        ),
        "tldr": (
            "Scholar AI puts a student's courses, an AI tutor that knows those courses, and "
            "the school's administration into one system. It is being built at Skye8 under "
            "my lead and is not public yet."
        ),
        "tech": ["LLMs", "FastAPI", "PostgreSQL", "Next.js"],
        "links": {"live": "https://scolarai.com"},
        "metrics": [],
        "pipeline": [
            {"stage": "Learn", "detail": "Courses, lessons and progress tracking."},
            {
                "stage": "Tutor",
                "detail": "An AI tutor that works from the student's own lessons and progress.",
            },
            {
                "stage": "Run the school",
                "detail": "Administration: classes, teachers, records.",
            },
        ],
        "sort_order": 20,
        "published": True,
        "body_md": (
            "## What it is\n\n"
            "A learning platform with three parts that usually live in three products: a "
            "learning management system where courses and progress live, an AI tutor that "
            "answers from the student's own material rather than from the open internet, "
            "and the administration a school needs to run classes, teachers and records.\n\n"
            "## Why it matters\n\n"
            "Students in Cameroon and across the region rarely get one-to-one help. A tutor "
            "that has read the same lessons the student has, and knows where they are "
            "struggling, is the closest thing to that at scale.\n\n"
            "## Where it stands\n\n"
            "The public site is live at scolarai.com, with the curriculum browser and sign-up. "
            "The AI tutor and the school administration are being built. This page will grow "
            "as they ship.\n\n"
            "## My role\n\n"
            "I lead the AI side: how the tutor grounds its answers in course material, how "
            "it is evaluated, and how it is served."
        ),
    },
    {
        "slug": "muyah-code",
        "title": "muyah-code",
        "status": "live",
        "featured": False,
        "year": 2026,
        "role": "Author",
        "category": "open-source",
        "highlight": "An agentic coding CLI for any model",
        "summary": (
            "Open-source agentic coding CLI that works with 20 model providers and local "
            "models, verifies its own work, and never runs a delete without asking."
        ),
        "tldr": (
            "A terminal coding agent that reads your code, makes the change, runs the tests "
            "and tells you plainly what happened. Works with hosted and local models."
        ),
        "tech": ["Python", "MCP", "ACP", "pytest", "GitHub Actions"],
        "links": {"repo": f"{GITHUB}/muyah-code"},
        "metrics": [
            {"label": "model providers", "value": "20", "note": "plus local models"},
            {"label": "licence", "value": "MIT", "note": ""},
        ],
        "pipeline": [],
        "sort_order": 30,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "muyah-code is an open-source coding agent for the terminal. It reads your code, "
            "makes the change, runs the tests and tells you straight what happened.\n\n"
            "## Model choice\n\n"
            "Twenty providers, including Anthropic, OpenAI, Gemini, OpenRouter, Groq, "
            "DeepSeek and Mistral. Local models through Ollama, LM Studio, llama.cpp, vLLM, "
            "or a free Colab GPU.\n\n"
            "## Safety\n\n"
            "It never runs a delete. It shows the exact command and leaves the decision to "
            "you. Risky actions like a force-push always ask, whatever the permission mode. "
            "`/rewind` restores code, conversation, or both to an earlier turn.\n\n"
            "## Working with it\n\n"
            "Permission modes (manual, edit, ask, plan, auto) switch with Shift+Tab. It checks "
            "its own work with real commands, and `/verify` runs the checks on demand. "
            "`/usage` breaks down token spend, with daily or per-session budgets. A side "
            "panel shows files touched, commands run and sub-agent activity, and past "
            "sessions can be replayed.\n\n"
            "## Extensibility\n\n"
            "Sub-agents, skills, MCP servers, hooks and worktrees. It reads Claude Code "
            "configuration such as `CLAUDE.md`. Editor integration with Zed, JetBrains and "
            "Neovim through the Agent Client Protocol, and voice input.\n\n"
            "Python 3.10 and newer. MIT licence."
        ),
    },

    {
        "slug": "meeting-copilot",
        "title": "Meeting Copilot",
        "status": "live",
        "featured": False,
        "year": 2026,
        "role": "Author: Rust core, speech pipeline, UI",
        "category": "ai",
        "highlight": "Live captions and answers for a call, on your own machine",
        "summary": (
            "A real-time meeting assistant for Windows. It captions both sides of a call "
            "on the device, suggests answers when someone asks a question, and writes the "
            "notes when the meeting ends."
        ),
        "tldr": (
            "Speech recognition runs locally on two channels, you and the other side, with "
            "echo cancellation so nobody is captioned twice. An always-on-top overlay stays "
            "out of screen shares. Only AI answers and notes use an online service, and only "
            "the one you choose."
        ),
        "tech": ["Rust", "Tauri 2", "Svelte 5", "On-device speech recognition", "Windows"],
        "links": {"repo": f"{GITHUB}/meeting-copilot"},
        "metrics": [
            {"label": "caption delay, fast model", "value": "~0.5 s", "note": "behind speech"},
            {"label": "audio channels", "value": "2", "note": "you and the other side"},
            {"label": "sent to the cloud", "value": "0 audio", "note": "speech stays on the device"},
        ],
        "pipeline": [
            {"stage": "Capture", "detail": "Microphone and system audio as two channels, with echo cancellation."},
            {"stage": "Transcribe", "detail": "On-device speech models; a fast one or a more accurate one for strong accents."},
            {"stage": "Correct", "detail": "Each line is punctuated and fixed a moment after it ends."},
            {"stage": "Assist", "detail": "When the other side asks a question, draft an answer from the conversation and your documents."},
            {"stage": "Notes", "detail": "Decisions and action items at the end, searchable history, copy as Markdown."},
        ],
        "sort_order": 32,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Meeting Copilot listens to a call on two channels, your microphone and whatever "
            "the computer is playing, and shows live captions in a small always-on-top panel "
            "that stays out of screen shares and recordings. When someone asks a question it "
            "suggests an answer. When the meeting ends it writes the notes.\n\n"
            "## Why on the device\n\n"
            "Meetings are private. Speech recognition runs locally, so no audio leaves the "
            "machine. Only the AI answers and the notes use an online service, and only the "
            "one you pick. API keys live in the Windows credential store.\n\n"
            "## The hard parts\n\n"
            "Two audio channels with echo cancellation, so the other side is not captioned a "
            "second time through your microphone. Captions that appear as words are spoken "
            "and then get corrected with punctuation a moment later. Reference documents "
            "(PDF, Word, slides) that answers can draw on, sending only the few passages that "
            "match a question.\n\n"
            "## Stack\n\n"
            "Tauri 2 with a Rust core and a Svelte 5 UI. A fast caption model about half a "
            "second behind speech, and a more accurate one that is much better with strong "
            "accents.\n\n"
            "## Status\n\n"
            "Working from source on Windows. A signed installer and automatic updates are not "
            "built yet."
        ),
    },
    {
        "slug": "longline",
        "title": "Longline",
        "status": "live",
        "featured": False,
        "year": 2026,
        "role": "Designer and engineer",
        "category": "game",
        "highlight": "A two-player board game for phone and PC, in 3D",
        "summary": (
            "Longline is a three-in-a-line board game for two players, on a phone or a PC. "
            "A 3D board, themed worlds, local and online play, and a rules engine that is "
            "tested on its own."
        ),
        "tldr": (
            "The rules live in one shared package with their own tests, the 3D board is "
            "drawn with Three.js inside a Svelte 5 app that installs as a PWA, and a small "
            "server runs the online matches. Themes change the whole scene, not just the "
            "colours."
        ),
        "tech": ["Svelte 5", "Three.js", "TypeScript", "Vite PWA", "Node", "Vitest"],
        "links": {},
        "metrics": [
            {"label": "players", "value": "2", "note": "same device or online"},
            {"label": "pieces each", "value": "3", "note": "place, then slide along the lines"},
            {"label": "runs on", "value": "phone + PC", "note": "one codebase, installs as an app"},
        ],
        "pipeline": [],
        "sort_order": 34,
        "published": True,
        "body_md": (
            "## The game\n\n"
            "Each player has three pieces. Place them, then slide along the lines until "
            "three of yours sit in a row. Easy to learn in a minute, hard to play well.\n\n"
            "## What I built\n\n"
            "A 3D board drawn with Three.js inside a Svelte 5 app, with themed scenes "
            "(a wooden table, a moonlit shrine, and more) that change the whole world, not "
            "just the colours. It installs as a progressive web app on a phone and runs in "
            "any browser on a PC.\n\n"
            "## Architecture\n\n"
            "A monorepo with three parts: a core package that holds the rules and is tested "
            "on its own with Vitest, a client that renders the board and handles input, and "
            "a small server for online matches. The client never decides who won; the rules "
            "package does, on both ends.\n"
        ),
    },
    {
        "slug": "abakwa-mythlands",
        "title": "Abakwa Mythlands",
        "status": "live",
        "featured": False,
        "year": 2026,
        "role": "Designer and engineer",
        "category": "game",
        "highlight": "An open-world 3D Bamenda, built from the real map",
        "summary": (
            "A blocky open-world game of the real Bamenda and the towns around it, and of "
            "Buea and Limbe on the coast, with a living town inside: people with families "
            "and work, fons and mayors, markets, farms, taxis and bikes. Alone or online."
        ),
        "tldr": (
            "Two regions built from OpenStreetMap: about 142,000 buildings in the North West "
            "and 94,000 in the South West, streamed in 128 m cells by a web worker. A "
            "simulation runs the people and the economy; players drive taxis, build on land "
            "they own, and earn every game day whether they are online or not."
        ),
        "tech": ["Three.js", "JavaScript", "WebGPU / WebGL2", "Web Workers", "Rapier physics", "Node + ws", "OpenStreetMap"],
        "links": {},
        "metrics": [
            {"label": "buildings, North West", "value": "142,000", "note": "Bamenda, Bambili, Bafut, Santa, Bali and more"},
            {"label": "buildings, South West", "value": "94,000", "note": "Buea, Molyko, Mutengene, Limbe"},
            {"label": "regions", "value": "2", "note": "a coach runs between them"},
        ],
        "pipeline": [
            {"stage": "Map", "detail": "Real roads, buildings and places from OpenStreetMap for both regions."},
            {"stage": "Stream", "detail": "The world is built in 128 m cells by a web worker, with low-detail proxies far away."},
            {"stage": "Simulate", "detail": "People with families and jobs, councils, markets, weather and news on the server."},
            {"stage": "Play", "detail": "Walk, drive taxis and bikes for fares, build on your plot, chat with everyone online."},
            {"stage": "Measure", "detail": "Scripts record draw calls, p95 frame time, stalls and GPU cost into docs/perf."},
        ],
        "sort_order": 35,
        "published": True,
        "body_md": (
            "## The world\n\n"
            "Abakwa Mythlands is Bamenda as a game: the real streets, quarters and landmarks, "
            "built from OpenStreetMap, with Bambili, Bafut, Santa, Bali and the other towns "
            "around it. A second region covers Buea on the slope of Mount Cameroon and Limbe "
            "on the sea. A coach runs between the two from the motor parks.\n\n"
            "Three references guide it, in this order: WorldBox for how it works (a living "
            "simulation), GTA for the real city, Roblox for the blocky look and for building.\n\n"
            "## A living town\n\n"
            "The server simulates people with families and work, fons and mayors, markets, "
            "farms and animals, weather and a daily newspaper. Players arrive with 20,000 "
            "FCFA, drive taxis and bikes for fares set by distance, claim a plot with the "
            "first piece they place, and build. A market stall earns from the people living "
            "around it; a house becomes a real home a family moves into, and pays rent. "
            "Everything earns every game day, whether the player is online or not.\n\n"
            "## Engineering\n\n"
            "Rendering is Three.js on WebGPU where it exists and WebGL2 elsewhere. The world "
            "streams as 128 m cells built off the main thread by a web worker, with low "
            "proxies beyond; driven vehicles can hand over to a Rapier physics worker. "
            "Performance is measured, not guessed: scripts take standard screenshots, drive "
            "down Commercial Avenue for 30 seconds, and record draw calls, triangles, p95 "
            "frame time, main-thread stalls and GPU time into the repository.\n\n"
            "It runs in a browser on a PC and on a phone, with a thumb stick and context "
            "buttons on touch screens, and installs nothing."
        ),
    },
    {
        "slug": "truck-parts-co",
        "title": "Truck Parts & Co.",
        "status": "live",
        "featured": False,
        "year": 2026,
        "role": "Designer and engineer, end to end",
        "category": "client",
        "highlight": "A parts yard in Phoenix that quotes from a list you build",
        "summary": (
            "Catalogue and quote-request site for a used truck parts yard in Phoenix, "
            "Arizona. Visitors browse the inventory, build a quote list and send it; staff "
            "manage stock and requests in an admin."
        ),
        "tldr": (
            "No online payment and no account to create: the yard quotes by phone, text or "
            "email, so the site is built around a quote list instead of a cart. Stock loads "
            "from a CSV and a folder of photos."
        ),
        "tech": ["React", "TypeScript", "Vite", "Tailwind", "Django 5", "Django REST Framework"],
        "links": {"live": "https://truckandpartsco.com"},
        "metrics": [],
        "pipeline": [],
        "sort_order": 42,
        "published": True,
        "body_md": (
            "## The brief\n\n"
            "A real yard with real stock and no interest in online checkout. People call, "
            "text or email for a price. The site had to make that faster, not replace it.\n\n"
            "## What I built\n\n"
            "An inventory people can browse by category, a quote list they fill as they go, "
            "and one send button. The request is saved and emailed to the business. Staff "
            "manage stock and quote requests at /admin. The starting stock loads from a CSV "
            "and a folder of photos, so the owner never touches a database.\n\n"
            "## Stack\n\n"
            "Vite, React and TypeScript with Tailwind on the front; Django 5 with Django REST "
            "Framework and JWT auth behind it. Deployed on a single VPS."
        ),
    },
    {
        "slug": "dream-tech-website",
        "title": "Dream Tech website",
        "status": "live",
        "featured": False,
        "year": 2026,
        "role": "Designer and engineer",
        "category": "client",
        "highlight": "A corporate site the company edits itself",
        "summary": (
            "The corporate website for Dream Tech, built from their product requirements "
            "document: public pages, careers and enquiries, with a CMS the team edits."
        ),
        "tldr": (
            "Next.js 16 with Payload CMS 3 inside the same server, on PostgreSQL. Roles, "
            "drafts, media, enquiries, applications and analytics in /admin. The build needs "
            "no database and the server applies its own migrations on start."
        ),
        "tech": ["Next.js 16", "Payload CMS 3", "PostgreSQL 17", "TypeScript", "Playwright"],
        "links": {"live": "https://dream-tech.tech"},
        "metrics": [],
        "pipeline": [],
        "sort_order": 44,
        "published": True,
        "body_md": (
            "## The brief\n\n"
            "A company site built from a formal PRD, in English and French, that the team "
            "can keep current without a developer.\n\n"
            "## What I built\n\n"
            "Public pages rendered from tag-cached CMS data, so edits made in the admin "
            "appear immediately and the production build needs no database. A Payload admin "
            "with roles, drafts, media, enquiries, job applications and analytics. Contact "
            "forms with validation, a honeypot and rate limiting, tested end to end with "
            "Playwright.\n\n"
            "## Stack\n\n"
            "Next.js 16 App Router and Payload CMS 3 in one TypeScript server on "
            "PostgreSQL 17. Mailpit for development email, Docker Compose for the "
            "infrastructure."
        ),
    },
    {
        "slug": "engines-and-transmissions-with-jay",
        "title": "Engines and Transmissions with Jay",
        "status": "live",
        "featured": False,
        "year": 2026,
        "role": "Designer and engineer",
        "category": "client",
        "highlight": "Find the part, ask the shop, in two taps",
        "summary": (
            "Website for an engines and transmissions shop in Hermon, Maine: stock, "
            "reviews, and a short ask-the-shop form that reaches the owner."
        ),
        "tldr": (
            "Built for people searching on a phone from a breakdown. The page leads with a "
            "part finder and the phone number, and the form is three fields."
        ),
        "tech": ["Next.js", "TypeScript", "Tailwind"],
        "links": {"live": "https://enginesandtransmissionswithjay.com"},
        "metrics": [],
        "pipeline": [],
        "sort_order": 46,
        "published": True,
        "body_md": (
            "## The brief\n\n"
            "A small shop that sells used engines and transmissions and wanted to be found "
            "and contacted easily.\n\n"
            "## What I built\n\n"
            "A fast static-first Next.js site: a part finder at the top, stock with photos, "
            "reviews, and an ask form that sends to the owner. Mobile first, because that is "
            "where the customers are.\n"
        ),
    },
    {
        "slug": "kodschul-seminar-management",
        "title": "Kodschul Seminar Management",
        "status": "live",
        "featured": False,
        "highlight": "The database refuses the double-booking, not the app",
        "summary": (
            "Seminar scheduling platform with trainer assignment, conflict detection, "
            "and AI-powered trainer matching."
        ),
        "role": "Full-stack engineer",
        "category": "web",
        "year": 2026,
        "tech": ["Next.js", "TypeScript", "PostgreSQL", "Docker Compose", "GitHub Actions"],
        "links": {"repo": f"{GITHUB}/kodschul-seminar-management"},
        "sort_order": 40,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "A scheduling platform for seminars: assigning trainers to sessions, detecting "
            "conflicts before they reach a calendar, and matching trainers to topics with a "
            "model.\n\n"
            "## The part I care about\n\n"
            "The CI pipeline re-proves the system's core guarantees on a clean machine on "
            "every push, including that **Postgres itself refuses to double-book a "
            "trainer**. That constraint is asserted against a real database rather than a "
            "mock, so it cannot quietly rot into a test that passes while production "
            "breaks.\n\n"
            "Putting the invariant in the database instead of the application layer means "
            "it holds no matter which code path tries to violate it.\n"
        ),
    },
    {
        "slug": "student-performance-prediction",
        "title": "Student Performance Prediction",
        "status": "live",
        "featured": False,
        "highlight": "Predictions a teacher can act on, with the reasons attached",
        "summary": (
            "Predicts whether a student will struggle with a lesson, from their learning "
            "history."
        ),
        "role": "ML engineer",
        "category": "ai",
        "year": 2026,
        "tech": ["Python", "XGBoost", "scikit-learn", "SHAP", "FastAPI"],
        "links": {"repo": f"{GITHUB}/student-performance-predication"},
        "sort_order": 50,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Takes a student's learning history and predicts whether they are likely to "
            "struggle with an upcoming lesson, early enough to do something about it.\n\n"
            "## The pipeline\n\n"
            "Feature engineering, three models compared against each other, and **SHAP "
            "explainability** so a prediction can be justified rather than just emitted.\n\n"
            "That last part matters: a model that flags a student without being able to say "
            "why is not something a teacher can act on responsibly.\n\n"
            "Served behind a documented REST API.\n"
        ),
    },
    {
        "slug": "veinrecon-biometric-verification",
        "title": "veinRecon, biometric verification",
        "status": "live",
        "featured": False,
        "highlight": "Identity from the veins on the back of a hand, fully offline",
        "summary": (
            "Offline verification of a person's identity from the vein pattern on the back "
            "of their hand."
        ),
        "role": "ML engineer: model, evaluation, and capture rig",
        "category": "ai",
        "year": 2026,
        "tech": ["TensorFlow", "MobileNetV2", "OpenCV", "TFLite", "Arduino"],
        "links": {},
        "sort_order": 36,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Verifies who someone is from the vein pattern on the back of their hand, "
            "entirely on-device. No network, no server holding biometrics.\n\n"
            "## How\n\n"
            "A MobileNetV2 feature extractor with Siamese and triplet matchers, exported to "
            "TFLite so it runs on the device itself.\n\n"
            "Evaluation is **subject-disjoint**: no person appears in both training and "
            "test data, so the scores reflect performance on genuinely unseen people rather "
            "than memorised individuals. That distinction is the difference between a "
            "number that means something and one that does not.\n\n"
            "## Data\n\n"
            "I built a custom Arduino-controlled infrared capture rig to collect the "
            "dataset, since nothing suitable existed.\n"
        ),
    },
    {
        "slug": "virtual-clinical-trial-simulator",
        "title": "Virtual Clinical Trial Simulator",
        "status": "live",
        "featured": False,
        "highlight": "Run the trial in software first",
        "summary": (
            "Generates realistic synthetic patients and simulates their response to malaria "
            "and sickle-cell treatments."
        ),
        "role": "Researcher and engineer, B.Eng dissertation (NAHPI)",
        "category": "ai",
        "year": 2026,
        "tech": ["PyTorch", "GANs", "Digital Twins", "FastAPI", "Next.js"],
        "links": {},
        "sort_order": 38,
        "published": True,
        "body_md": (
            "## The problem\n\n"
            "Clinical trial data is scarce and legally protected, which makes it hard to "
            "explore treatment questions without access researchers often cannot get.\n\n"
            "## What I built\n\n"
            "A GAN and digital-twin framework that produces realistic synthetic patients "
            "and simulates how they respond to malaria and sickle-cell treatments, so a "
            "trial can be run in software first.\n\n"
            "Wrapped in a FastAPI service with a Next.js interface, so it is usable by "
            "researchers rather than only by its author.\n\n"
            "## Status\n\n"
            "My B.Eng dissertation at NAHPI. Unpublished research, so the source is private.\n"
        ),
    },
    {
        "slug": "myskills2earn",
        "title": "MySkills2Earn",
        "status": "live",
        "featured": False,
        "highlight": "An LLM gateway with quotas and PII filtering built in",
        "summary": (
            "A learning and earning platform with course management, creator analytics, "
            "payments, and referrals."
        ),
        "role": "Backend and AI engineer",
        "category": "web",
        "year": 2026,
        "tech": ["FastAPI", "PostgreSQL", "Redis", "Celery", "Stripe", "AWS S3"],
        "links": {},
        "sort_order": 80,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Course management, creator analytics, payments, and a referral system.\n\n"
            "## The AI layer\n\n"
            "A multi-provider gateway over Gemini, Claude, and OpenAI that enforces "
            "**per-role usage quotas** and filters PII before anything leaves the system, "
            "with audit logging, Prometheus metrics, and Sentry throughout.\n\n"
            "The point of the gateway is that no single team can exhaust the budget, and no "
            "personal data reaches a third-party model by accident.\n\n"
            "## Status\n\n"
            "Client work under NDA, so the source is private.\n"
        ),
    },
    {
        "slug": "izishop",
        "title": "IziShop",
        "status": "live",
        "featured": False,
        "highlight": "A multi-vendor marketplace, end to end",
        "summary": (
            "A multi-vendor e-commerce marketplace built end to end: auth, vendor and "
            "catalog management, and order flow."
        ),
        "role": "Full-stack engineer",
        "category": "web",
        "year": 2025,
        "tech": ["FastAPI", "SQLAlchemy", "PostgreSQL", "React", "Redux Toolkit"],
        "links": {"repo": f"{GITHUB}/izishop-backend"},
        "sort_order": 90,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "A marketplace with many vendors: JWT authentication, vendor and catalog "
            "management, and the full order flow.\n\n"
            "## Scale\n\n"
            "My largest codebase, split across a FastAPI backend and a React 18 frontend.\n\n"
            "The [backend](https://github.com/MUYAHGaious/izishop-backend) and "
            "[frontend](https://github.com/MUYAHGaious/izishop-frontend) live in separate "
            "repositories.\n"
        ),
    },
    {
        "slug": "tease",
        "title": "TEASE",
        "status": "live",
        "featured": False,
        "highlight": "Live buses, seat selection and QR tickets in one app",
        "summary": (
            "Cross-platform bus booking and tracking: live GPS with ETAs, seat selection, "
            "and QR ticketing."
        ),
        "role": "Mobile engineer",
        "category": "mobile",
        "year": 2025,
        "tech": ["Flutter", "Dart", "Riverpod", "Google Maps", "Material 3"],
        "links": {"repo": f"{GITHUB}/tease"},
        "sort_order": 48,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Book a bus seat, watch the bus arrive on a live map with an ETA, and board "
            "with a QR ticket.\n\n"
            "## Architecture\n\n"
            "Clean architecture with MVVM, shipping to Android, iOS, and web from a single "
            "codebase.\n"
        ),
    },
]

SERVICES = [
    {
        "title": "AI product delivery",
        "blurb": "From an idea to a model running inside a product people actually use.",
        "points": [
            "Scoping what AI should and should not do",
            "Data collection and cleaning plans",
            "Models served behind real APIs",
            "Shipped into web and mobile apps",
        ],
        "featured": True,
        "sort_order": 10,
        "published": True,
        "body_md": (
            "Most AI work dies between the notebook and the product. I take it the whole "
            "way: deciding what the model should do, getting the data, training and "
            "evaluating it, serving it, and wiring it into the app users open.\n\n"
            "Malegado is the reference: text and speech models for 590 languages, running "
            "behind a streaming API inside a mobile app.\n"
        ),
    },
    {
        "title": "Model training and deployment",
        "blurb": "Fine-tuning, speech and text models, evaluation that means something, serving.",
        "points": [
            "Fine-tuning text-to-text models",
            "Text-to-speech and speech-to-text",
            "Held-out evaluation per language or segment",
            "Streaming inference on a latency budget",
        ],
        "featured": True,
        "sort_order": 20,
        "published": True,
        "body_md": (
            "I train models and I put them in production. That includes low-resource "
            "languages where there is no off-the-shelf model to call, and on-device models "
            "where there is no server to call at all.\n\n"
            "Evaluation gets as much attention as training. A number without a baseline and "
            "a held-out set is not a result.\n"
        ),
    },
    {
        "title": "Technical leadership and advisory",
        "blurb": "Leading AI teams, reviewing architectures, advising companies adding AI.",
        "points": [
            "Running an AI department",
            "Architecture and model reviews",
            "Hiring and mentoring engineers",
            "Honest advice on what AI will not fix",
        ],
        "featured": True,
        "sort_order": 30,
        "published": True,
        "body_md": (
            "I lead the AI department at Skye8. The team reports to me, and I am still "
            "hands-on in the code, which is the only way I know to review work well.\n\n"
            "For companies adding AI, I can look at what you are planning and tell you what "
            "will work, what will not, and what it will cost to run.\n"
        ),
    },
]

# Dates are placeholders until Muyah confirms them; the summaries say so.
EXPERIENCE = [
    {
        "role": "AI Department Lead",
        "company": "Skye8",
        "location": "Bamenda, Cameroon",
        "start_date": date(2026, 1, 1),
        "end_date": None,
        "summary": (
            "Lead the AI department. The team reports to me. I own the models, the "
            f"pipelines and the people who build them. Start date {TO_CONFIRM}."
        ),
        "highlights": [
            "Malegado: text and speech models and real-time talk-back across 590 languages",
            "Scholar AI: AI tutor, LMS and school system, in build",
            "Supervise and mentor the AI engineers and data-science interns",
        ],
        "sort_order": 10,
        "published": True,
    },
    {
        "role": "AI Engineer",
        "company": "Skye8",
        "location": "Bamenda, Cameroon",
        "start_date": date(2025, 7, 1),
        "end_date": date(2025, 12, 31),
        "summary": (
            "Trained the text-to-text and text-to-speech models for Malegado and built its "
            f"chatbots and voice talk-back. Dates {TO_CONFIRM}."
        ),
        "highlights": [],
        "sort_order": 20,
        "published": True,
    },
    {
        "role": "Data Scientist",
        "company": "Skye8",
        "location": "Bamenda, Cameroon",
        "start_date": date(2025, 1, 1),
        "end_date": date(2025, 6, 30),
        "summary": (
            "Data science and machine learning across Skye8 products. Supervised intern "
            f"projects, including a loan-collections tool. Dates {TO_CONFIRM}."
        ),
        "highlights": [],
        "sort_order": 30,
        "published": True,
    },
    {
        "role": "Back End Developer",
        "company": "Skye8",
        "location": "Bamenda, Cameroon",
        "start_date": date(2024, 1, 1),
        "end_date": date(2024, 12, 31),
        "summary": f"FastAPI and PostgreSQL services for Skye8 platforms. Dates {TO_CONFIRM}.",
        "highlights": [],
        "sort_order": 40,
        "published": True,
    },
]

# Real quotes from real people only. Add them from /admin/services.
TESTIMONIALS: list[dict] = []

# Placeholders for --with-examples, worded so they cannot be mistaken for real
# endorsements. Delete before going live.
EXAMPLE_TESTIMONIALS = [
    {
        "quote": (
            "This is placeholder text so the testimonials section can be previewed. "
            "Replace it with something a real client actually said."
        ),
        "author": "Example placeholder",
        "role": "Delete me, Your Company",
        "sort_order": 10,
        "published": True,
    },
]

POSTS = [
    {
        "slug": "constraints-belong-in-the-database",
        "title": "Constraints belong in the database",
        "excerpt": (
            "Why I let Postgres refuse to double-book a trainer instead of checking for it "
            "in application code."
        ),
        "tags": ["postgres", "engineering"],
        "published": False,
        "body_md": (
            "This post is a draft. It will not appear on the site until you publish it from "
            "/admin.\n\n"
            "An application-level check is a promise that every future code path will "
            "remember to make it. A database constraint is a guarantee that none of them "
            "can skip it.\n\n"
            "In the seminar scheduler, the rule that a trainer cannot be in two places at "
            "once lives in Postgres. The CI pipeline asserts it against a real database on "
            "every push, so the guarantee is re-proven rather than assumed.\n"
        ),
    }
]

SETTINGS = {
    "name": "Muyah Gaious Angwe",
    "greeting": "",
    "title": "AI Engineer · AI Department Lead, Skye8",
    "tagline": "AI engineer. Department lead. Still shipping code every week.",
    "location": "Bamenda, Cameroon",
    "email": "contact@muyah.dev",
    "bio_md": (
        "I lead the AI department at Skye8 in Bamenda. The team reports to me, and I am "
        "responsible for the models we train, the pipelines that serve them, and the "
        "people who build them.\n\n"
        "The work I am proudest of is inside Malegado, a language and culture learning "
        "app. I trained its text-to-text and text-to-speech models and built the chatbots "
        "and the real-time voice talk-back, so a learner can speak Hausa or Yoruba or "
        "Amharic and be answered out loud. The pipeline covers all 590 languages the app "
        "supports, and we are still adding more.\n\n"
        "Right now the department is building Scholar AI, an AI tutor, learning management "
        "and school system in one.\n\n"
        "I hold a B.Eng in Computer Engineering from NAHPI, the National Higher Polytechnic "
        "Institute at the University of Bamenda, and I am doing my M.Eng there now. I am "
        "open to senior AI roles and to consulting with companies that want AI that "
        "actually ships."
    ),
    "stats": [
        {"label": "languages in the Malegado pipeline", "value": "590+"},
        {"label": "department reporting to me", "value": "1"},
        {"label": "flagship AI products", "value": "2"},
        {"label": "public repositories on GitHub", "value": "40"},
    ],
    "education": [
        {
            "degree": "M.Eng",
            "school": "NAHPI, University of Bamenda",
            "years": "2026 to present",
            "status": "in progress",
        },
        {
            "degree": "B.Eng Computer Engineering",
            "school": "NAHPI, University of Bamenda",
            "years": f"{TO_CONFIRM} to 2026",
            "status": "",
        },
    ],
    "socials": [
        {"label": "GitHub", "url": GITHUB},
        {"label": "LinkedIn", "url": LINKEDIN},
        {"label": "Email", "url": "mailto:contact@muyah.dev"},
    ],
}


async def seed(force: bool = False, with_examples: bool = False) -> None:
    async with SessionFactory() as db:
        await ensure_admin_user(db)
        settings_row = await ensure_site_settings(db)

        existing = await db.scalar(select(func.count()).select_from(Project)) or 0
        if existing and not force:
            print(f"{existing} project(s) already exist, nothing to do. Use --force to replace.")
            return

        if force:
            for model in (Project, Experience, Post, Service, Testimonial):
                await db.execute(delete(model))

        db.add_all([Project(**row) for row in PROJECTS])
        db.add_all([Experience(**row) for row in EXPERIENCE])
        db.add_all([Post(**row) for row in POSTS])
        db.add_all([Service(**row) for row in SERVICES])
        db.add_all(
            [
                Testimonial(**row)
                for row in (EXAMPLE_TESTIMONIALS if with_examples else TESTIMONIALS)
            ]
        )

        for field, value in SETTINGS.items():
            setattr(settings_row, field, value)

        await db.commit()
        print(
            f"Seeded {len(PROJECTS)} projects, {len(SERVICES)} services, "
            f"{len(EXPERIENCE)} roles and {len(POSTS)} draft post(s), plus your profile.\n"
            "Search the site for '[to confirm]' and fill those in from /admin. Still to add: "
            "a portrait and CV (/admin/settings) and cover images (/admin/media)."
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete existing content before seeding.",
    )
    parser.add_argument(
        "--with-examples",
        action="store_true",
        help=(
            "Also insert a clearly-labelled placeholder testimonial so the section "
            "can be previewed. Delete it before going live."
        ),
    )
    args = parser.parse_args()
    asyncio.run(seed(force=args.force, with_examples=args.with_examples))


if __name__ == "__main__":
    main()
