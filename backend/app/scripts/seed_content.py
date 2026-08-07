"""Populate the database with Muyah's real content.

Everything here comes from his own GitHub profile — real projects, real stack,
real descriptions. Nothing is invented. Where a fact isn't known (employment
dates, client names under NDA), the record is left out rather than guessed at.

Run with:  python -m app.scripts.seed_content
Existing rows are left untouched; pass --force to replace them.
"""

import argparse
import asyncio

from sqlalchemy import delete, func, select

from app.core.db import SessionFactory
from app.models import Experience, Post, Project, Service, Testimonial
from app.services.seed import ensure_admin_user, ensure_site_settings

GITHUB = "https://github.com/MUYAHGaious"

PROJECTS = [
    {
        "slug": "kodschul-seminar-management",
        "title": "Kodschul Seminar Management",
        "summary": (
            "Seminar scheduling platform with trainer assignment, conflict detection, "
            "and AI-powered trainer matching."
        ),
        "role": "Full-stack engineer",
        "category": "web",
        "year": 2026,
        "tech": ["Next.js", "TypeScript", "PostgreSQL", "Docker Compose", "GitHub Actions"],
        "links": {"repo": f"{GITHUB}/kodschul-seminar-management"},
        "sort_order": 10,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "A scheduling platform for seminars: assigning trainers to sessions, detecting "
            "conflicts before they reach a calendar, and matching trainers to topics.\n\n"
            "## The part I care about\n\n"
            "The CI pipeline re-proves the system's core guarantees on a clean machine on "
            "every push — including that **Postgres itself refuses to double-book a "
            "trainer**. That constraint is asserted against a real database rather than a "
            "mock, so it cannot quietly rot into a test that passes while production "
            "breaks.\n\n"
            "Putting the invariant in the database instead of the application layer means "
            "it holds no matter which code path tries to violate it.\n"
        ),
    },
    {
        "slug": "virtual-clinical-trial-simulator",
        "title": "Virtual Clinical Trial Simulator",
        "summary": (
            "Generates realistic synthetic patients and simulates their response to malaria "
            "and sickle-cell treatments."
        ),
        "role": "Researcher and engineer — B.Eng dissertation",
        "category": "ai",
        "year": 2026,
        "tech": ["PyTorch", "GANs", "Digital Twins", "FastAPI", "Next.js"],
        "links": {},
        "sort_order": 20,
        "published": True,
        "body_md": (
            "## The problem\n\n"
            "Clinical trial data is scarce and legally protected, which makes it hard to "
            "explore treatment questions without access researchers often can't get.\n\n"
            "## What I built\n\n"
            "A GAN and digital-twin framework that produces realistic synthetic patients "
            "and simulates how they respond to malaria and sickle-cell treatments — so a "
            "trial can be run in software first.\n\n"
            "Wrapped in a FastAPI service with a Next.js interface, so it's usable by "
            "researchers rather than only by its author.\n\n"
            "## Status\n\n"
            "My B.Eng dissertation. Unpublished research, so the source is private.\n"
        ),
    },
    {
        "slug": "veinrecon-biometric-verification",
        "title": "veinRecon — Biometric Verification",
        "summary": (
            "Offline verification of a person's identity from the vein pattern on the back "
            "of their hand."
        ),
        "role": "ML engineer — model, evaluation, and capture rig",
        "category": "ai",
        "year": 2026,
        "tech": ["TensorFlow", "MobileNetV2", "OpenCV", "TFLite", "Arduino"],
        "links": {},
        "sort_order": 30,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Verifies who someone is from the vein pattern on the back of their hand, "
            "entirely on-device — no network, no server holding biometrics.\n\n"
            "## How\n\n"
            "A MobileNetV2 feature extractor with Siamese and triplet matchers, exported to "
            "TFLite so it runs on the device itself.\n\n"
            "Evaluation is **subject-disjoint**: no person appears in both training and "
            "test data, so the scores reflect performance on genuinely unseen people rather "
            "than memorised individuals. That distinction is the difference between a "
            "number that means something and one that doesn't.\n\n"
            "## Data\n\n"
            "I built a custom Arduino-controlled infrared capture rig to collect the "
            "dataset, since nothing suitable existed.\n"
        ),
    },
    {
        "slug": "myskills2earn",
        "title": "MySkills2Earn",
        "summary": (
            "A learning and earning platform with course management, creator analytics, "
            "payments, and referrals."
        ),
        "role": "Backend and AI engineer",
        "category": "web",
        "year": 2026,
        "tech": ["FastAPI", "PostgreSQL", "Redis", "Celery", "Stripe", "AWS S3"],
        "links": {},
        "sort_order": 40,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Course management, creator analytics, payments, and a referral system.\n\n"
            "## The AI layer\n\n"
            "A multi-provider gateway over Gemini, Claude, and OpenAI that enforces "
            "**per-role usage quotas** and filters PII before anything leaves the system — "
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
        "summary": (
            "A multi-vendor e-commerce marketplace built end to end — auth, vendor and "
            "catalog management, and order flow."
        ),
        "role": "Full-stack engineer",
        "category": "web",
        "year": 2025,
        "tech": ["FastAPI", "SQLAlchemy", "PostgreSQL", "React", "Redux Toolkit"],
        "links": {"repo": f"{GITHUB}/izishop-backend"},
        "sort_order": 50,
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
        "slug": "student-performance-prediction",
        "title": "Student Performance Prediction",
        "summary": (
            "Predicts whether a student will struggle with a lesson, from their learning "
            "history."
        ),
        "role": "ML engineer",
        "category": "ai",
        "year": 2026,
        "tech": ["Python", "XGBoost", "scikit-learn", "SHAP", "FastAPI"],
        "links": {"repo": f"{GITHUB}/student-performance-predication"},
        "sort_order": 60,
        "published": True,
        "body_md": (
            "## What it does\n\n"
            "Takes a student's learning history and predicts whether they're likely to "
            "struggle with an upcoming lesson — early enough to do something about it.\n\n"
            "## The pipeline\n\n"
            "Feature engineering, three models compared against each other, and **SHAP "
            "explainability** so a prediction can be justified rather than just emitted.\n\n"
            "That last part matters: a model that flags a student without being able to say "
            "why is not something a teacher can act on responsibly.\n\n"
            "Served behind a documented REST API.\n"
        ),
    },
    {
        "slug": "tease",
        "title": "TEASE",
        "summary": (
            "Cross-platform bus booking and tracking: live GPS with ETAs, seat selection, "
            "and QR ticketing."
        ),
        "role": "Mobile engineer",
        "category": "mobile",
        "year": 2025,
        "tech": ["Flutter", "Dart", "Riverpod", "Google Maps", "Material 3"],
        "links": {"repo": f"{GITHUB}/tease"},
        "sort_order": 70,
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
        "title": "Full-stack product engineering",
        "blurb": "Production web systems built end to end, not prototypes that need rewriting.",
        "points": [
            "Containerised FastAPI services",
            "TypeScript and Next.js frontends",
            "Real migrations and health checks",
            "CI that proves it still works",
        ],
        "featured": True,
        "sort_order": 10,
        "published": True,
        "body_md": (
            "I build the whole system: the API, the database schema and its migrations, the "
            "frontend, and the pipeline that deploys it.\n\n"
            "I care about the parts that decide whether software survives contact with "
            "production — migrations that actually run, health checks that mean something, "
            "and constraints enforced by the database rather than hoped for in the "
            "application.\n"
        ),
    },
    {
        "title": "AI where it earns its place",
        "blurb": "LLM gateways, computer vision, and predictive models — with the guardrails.",
        "points": [
            "Multi-provider LLM gateways",
            "Per-role quotas and PII filtering",
            "Computer vision and on-device models",
            "Explainable predictions, not black boxes",
        ],
        "featured": True,
        "sort_order": 20,
        "published": True,
        "body_md": (
            "AI is worth adding when it does something the alternative can't — and worth "
            "instrumenting when it does.\n\n"
            "That has meant a multi-provider gateway with per-role quotas and PII filtering, "
            "a GAN-based simulator for research where real data is legally out of reach, and "
            "a biometric model small enough to run offline on a phone.\n\n"
            "Where a model makes a decision about a person, I build in the ability to explain "
            "why.\n"
        ),
    },
    {
        "title": "Cross-platform mobile",
        "blurb": "One Flutter codebase shipping to Android, iOS, and web.",
        "points": [
            "Flutter and Dart",
            "Clean architecture with MVVM",
            "Live location and maps",
            "Offline-capable clients",
        ],
        "featured": True,
        "sort_order": 30,
        "published": True,
        "body_md": (
            "Flutter clients on top of the same backends I build — so the mobile app isn't "
            "a separate system with its own drift, it's another consumer of an API that "
            "already has a contract.\n"
        ),
    },
]

# Experience is deliberately empty: employment dates and titles are facts I don't
# have, and inventing them is exactly what made the previous site untrustworthy.
# Add real roles from /admin/experience.
EXPERIENCE: list[dict] = []

# Real quotes from real people only. Add them from /admin/services.
TESTIMONIALS: list[dict] = []

# Placeholders for --with-examples, so the section can be seen while it is being
# designed. Worded so they cannot be mistaken for real endorsements: the author
# is not a person's name and the text says what it is. Delete before going live.
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
    {
        "quote": (
            "A second placeholder, here to show how the marquee looks with more than "
            "one card. Not a real quote from a real person."
        ),
        "author": "Example placeholder",
        "role": "Delete me, Another Company",
        "sort_order": 20,
        "published": True,
    },
    {
        "quote": (
            "A third placeholder. Add real quotes at /admin/services and remove these "
            "before the site goes live."
        ),
        "author": "Example placeholder",
        "role": "Delete me, Third Company",
        "sort_order": 30,
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
            "This post is a draft — it won't appear on the site until you publish it from "
            "/admin.\n\n"
            "An application-level check is a promise that every future code path will "
            "remember to make it. A database constraint is a guarantee that none of them "
            "can skip it.\n\n"
            "In the seminar scheduler, the rule that a trainer can't be in two places at "
            "once lives in Postgres. The CI pipeline asserts it against a real database on "
            "every push, so the guarantee is re-proven rather than assumed.\n\n"
            "Replace this with whatever you actually want to write about.\n"
        ),
    }
]

SETTINGS = {
    "name": "Muyah Gaious Angwe",
    "greeting": "Hello, I'm",
    "tagline": "Full-stack engineer building AI-powered products.",
    "location": "Bamenda, Cameroon",
    "email": "hello@muyah.dev",
    "bio_md": (
        "I build production web systems end to end — containerised FastAPI services with "
        "real migrations, TypeScript frontends, and Flutter clients on top.\n\n"
        "Lately I've been putting AI where it earns its place: a multi-provider LLM gateway "
        "with per-role quotas, a GAN-based clinical trial simulator, and a biometric model "
        "that runs offline on-device.\n\n"
        "I care about the boring parts that make software real — migrations, CI, health "
        "checks, and constraints enforced by the database rather than hoped for in the app.\n\n"
        "I'm finishing a B.Eng in Computer Engineering at the University of Bamenda, and I'm "
        "open to full-stack and AI engineering roles. If you're building something that needs "
        "to actually run in production, let's talk."
    ),
    "socials": [
        {"label": "GitHub", "url": GITHUB},
        {"label": "LinkedIn", "url": "https://linkedin.com/in/muyah-gaious-angwe-1b5976254"},
        {"label": "Email", "url": "mailto:hello@muyah.dev"},
    ],
}


async def seed(force: bool = False, with_examples: bool = False) -> None:
    async with SessionFactory() as db:
        await ensure_admin_user(db)
        settings_row = await ensure_site_settings(db)

        existing = await db.scalar(select(func.count()).select_from(Project)) or 0
        if existing and not force:
            print(f"{existing} project(s) already exist — nothing to do. Use --force to replace.")
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
            f"Seeded {len(PROJECTS)} projects, {len(SERVICES)} services, and "
            f"{len(POSTS)} draft post(s), plus your profile.\n"
            "Still to add yourself: work history (/admin/experience), a portrait and CV "
            "(/admin/settings), and cover images (/admin/media)."
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
            "Also insert clearly-labelled placeholder testimonials so the section "
            "can be previewed. Delete them before going live."
        ),
    )
    args = parser.parse_args()
    asyncio.run(seed(force=args.force, with_examples=args.with_examples))


if __name__ == "__main__":
    main()
