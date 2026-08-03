"""Populate the database with starter content.

Every string here is an obvious placeholder. Nothing invents an employer, a date,
a metric, or a testimonial — a portfolio that ships with fabricated credentials is
worse than one that ships empty, because the fabrications are what a visitor reads
first. Replace all of it from /admin.

Run with:  python -m app.scripts.seed_content
Existing rows are left untouched; pass --force to replace them.
"""

import argparse
import asyncio
from datetime import date

from sqlalchemy import delete, func, select

from app.core.db import SessionFactory
from app.models import Experience, Post, Project
from app.services.seed import ensure_admin_user, ensure_site_settings

PROJECTS = [
    {
        "slug": "project-one",
        "title": "Project one",
        "summary": "One sentence describing what this project is and who it was for.",
        "role": "Your role on the project",
        "category": "web",
        "year": 2025,
        "tech": ["Tech", "Stack", "Here"],
        "links": {},
        "sort_order": 10,
        "published": True,
        "body_md": (
            "## The problem\n\n"
            "What needed solving, and why it mattered. Two or three sentences.\n\n"
            "## What I built\n\n"
            "The approach you took and the decisions worth explaining. This is the part "
            "people actually read — say what was hard and how you handled it.\n\n"
            "## Outcome\n\n"
            "What changed as a result. Use real numbers if you have them, and leave this "
            "section out entirely if you don't.\n"
        ),
    },
    {
        "slug": "project-two",
        "title": "Project two",
        "summary": "A second placeholder entry, so the grid layout has something to show.",
        "role": "Your role on the project",
        "category": "data",
        "year": 2025,
        "tech": ["Tech", "Stack", "Here"],
        "links": {},
        "sort_order": 20,
        "published": True,
        "body_md": (
            "## The problem\n\nReplace this text from the admin panel.\n\n"
            "## What I built\n\nReplace this text from the admin panel.\n"
        ),
    },
    {
        "slug": "project-three",
        "title": "Project three",
        "summary": "A third placeholder entry. Delete any of these once you add real work.",
        "role": "Your role on the project",
        "category": "web",
        "year": 2024,
        "tech": ["Tech", "Stack", "Here"],
        "links": {},
        "sort_order": 30,
        "published": True,
        "body_md": "## The problem\n\nReplace this text from the admin panel.\n",
    },
]

EXPERIENCE = [
    {
        "role": "Your job title",
        "company": "Where you worked",
        "location": "City, Country",
        "start_date": date(2024, 1, 1),
        "end_date": None,
        "summary": "One or two sentences on what the role involved.",
        "highlights": [
            "Something specific you shipped or improved.",
            "Another concrete contribution — avoid vague claims.",
        ],
        "sort_order": 10,
        "published": True,
    },
    {
        "role": "An earlier job title",
        "company": "An earlier employer",
        "location": "City, Country",
        "start_date": date(2022, 1, 1),
        "end_date": date(2023, 12, 31),
        "summary": "One or two sentences on what the role involved.",
        "highlights": ["Something specific you shipped or improved."],
        "sort_order": 20,
        "published": True,
    },
]

POSTS = [
    {
        "slug": "hello",
        "title": "Setting up this site",
        "excerpt": "A starter post so the writing section is not empty. Edit or delete it.",
        "tags": ["meta"],
        "published": False,
        "body_md": (
            "This post is a draft, so it is not visible on the public site yet.\n\n"
            "Everything on this site is editable from `/admin`:\n\n"
            "- **Projects** — the work index and each case study\n"
            "- **Experience** — the timeline on the about page\n"
            "- **Writing** — posts like this one\n"
            "- **Settings** — your name, bio, location, social links, and CV\n\n"
            "Markdown works here: **bold**, *italic*, `code`, lists, and links.\n"
        ),
    }
]


async def seed(force: bool = False) -> None:
    async with SessionFactory() as db:
        await ensure_admin_user(db)
        settings_row = await ensure_site_settings(db)

        existing = await db.scalar(select(func.count()).select_from(Project)) or 0
        if existing and not force:
            print(f"{existing} project(s) already exist — nothing to do. Use --force to replace.")
            return

        if force:
            for model in (Project, Experience, Post):
                await db.execute(delete(model))

        db.add_all([Project(**row) for row in PROJECTS])
        db.add_all([Experience(**row) for row in EXPERIENCE])
        db.add_all([Post(**row) for row in POSTS])

        settings_row.name = settings_row.name or "Muyah"
        settings_row.tagline = settings_row.tagline or "A short line about what you do."
        settings_row.location = settings_row.location or "Your city"
        settings_row.bio_md = settings_row.bio_md or (
            "Two or three sentences about who you are and what you work on. Written in "
            "your own voice — this is the first thing anyone reads.\n\n"
            "Replace this from the admin panel."
        )
        settings_row.socials = settings_row.socials or [
            {"label": "GitHub", "url": "https://github.com/"},
            {"label": "Email", "url": "mailto:you@example.com"},
        ]

        await db.commit()
        print(
            f"Seeded {len(PROJECTS)} projects, {len(EXPERIENCE)} experience entries, "
            f"and {len(POSTS)} post(s). All placeholder text — edit it at /admin."
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete existing projects, experience, and posts before seeding.",
    )
    asyncio.run(seed(force=parser.parse_args().force))


if __name__ == "__main__":
    main()
