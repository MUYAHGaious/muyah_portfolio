"""Attach real screenshots to projects as cover images.

The screenshots live in ``app/scripts/covers/<slug>.<ext>`` so this works the
same on a laptop and on the server. Each is a real capture: the project's own
repository screenshot, a live site captured with
``frontend/scripts/shoot-sites.mjs``, or a screenshot from the local checkout.
A project with no file here keeps the typographic stand-in the site draws.

Every image goes through the same pipeline as an admin upload (validated by
decoding, EXIF stripped, WebP renditions) and gets a Media row.

Run with:  python -m app.scripts.seed_covers
Re-running replaces each listed project's cover.
"""

import asyncio
from pathlib import Path

from sqlalchemy import select

from app.core.db import SessionFactory
from app.models import Media, Project
from app.services.media import InvalidUploadError, store_upload

COVERS_DIR = Path(__file__).resolve().parent / "covers"

ALT: dict[str, str] = {
    "malegado": "Malegado's website: where language meets culture, with lessons and community",
    "scholar-ai": "Scolarai's landing page: learning that adapts to your child, choose a curriculum",
    "muyah-code": "muyah-code in a terminal: the welcome screen with model, mode and project",
    "abakwa-mythlands": "Abakwa Mythlands from the drone view: the blocky roads and houses of Bamenda",
    "longline": "Longline on a moonlit shrine: a 3D three-in-a-line board mid-match",
    "veinrecon-biometric-verification": "veinRecon vein finder: infrared hand image with detected veins highlighted in green",
    "virtual-clinical-trial-simulator": "Virtual Clinical Trial Simulator: patient, treatment and a 42-day parasite trajectory",
    "kodschul-seminar-management": "Kodschul dashboard with upcoming seminars, trainer assignments and booked value",
    "dream-tech-website": "Dream Tech home page: Technology for a Better Tomorrow",
    "tease": "TEASE booking site: routes and departures for bus travel in Cameroon",
}


async def seed() -> None:
    async with SessionFactory() as db:
        for path in sorted(COVERS_DIR.iterdir()):
            if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
                continue
            slug = path.stem
            project = await db.scalar(select(Project).where(Project.slug == slug))
            if project is None:
                print(f"skip {slug}: no such project")
                continue
            try:
                stored = store_upload(path.read_bytes())
            except (OSError, InvalidUploadError) as error:
                print(f"skip {slug}: {error}")
                continue

            media = Media(
                filename=stored.filename,
                original_name=path.name[:255],
                alt_text=ALT.get(slug, f"Screenshot of {project.title}"),
                mime=stored.mime,
                width=stored.width,
                height=stored.height,
                size_bytes=stored.size_bytes,
                variants=stored.variants,
            )
            db.add(media)
            await db.flush()
            project.cover_image_id = media.id
            print(f"{slug}: cover set ({stored.width}x{stored.height})")
        await db.commit()


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
