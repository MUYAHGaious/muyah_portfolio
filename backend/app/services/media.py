"""Upload handling: validation, EXIF stripping, and WebP rendition generation.

Two kinds of file are accepted:
  * images — re-encoded to WebP at several widths, metadata discarded
  * PDFs   — stored verbatim, for the CV download

Validation never trusts the filename or the browser-supplied content type. Images
are proved by decoding them; PDFs by their magic bytes.
"""

import io
import secrets
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, UnidentifiedImageError

from app.core.config import settings

# Widths generated for responsive images. Anything wider than the source is skipped.
RENDITION_WIDTHS = (640, 1280, 1920)

ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}
PDF_MAGIC = b"%PDF-"

# Guards against decompression-bomb images that are small on disk but enormous in memory.
MAX_PIXELS = 50_000_000


class InvalidUploadError(ValueError):
    """The uploaded bytes are not a file type we accept."""


@dataclass(frozen=True)
class StoredUpload:
    filename: str
    mime: str
    width: int
    height: int
    size_bytes: int
    variants: dict[str, str]


def _upload_root() -> Path:
    root = Path(settings.upload_dir)
    root.mkdir(parents=True, exist_ok=True)
    return root


def _store_pdf(data: bytes) -> StoredUpload:
    name = f"{secrets.token_hex(12)}.pdf"
    (_upload_root() / name).write_bytes(data)
    return StoredUpload(
        filename=name,
        mime="application/pdf",
        width=0,
        height=0,
        size_bytes=len(data),
        variants={},
    )


def _store_image(data: bytes) -> StoredUpload:
    try:
        image = Image.open(io.BytesIO(data))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidUploadError("File is not a readable image") from exc

    if image.format not in ALLOWED_IMAGE_FORMATS:
        raise InvalidUploadError(f"Unsupported image format: {image.format}")

    if image.width * image.height > MAX_PIXELS:
        raise InvalidUploadError("Image dimensions are too large")

    # Re-encoding through a fresh RGB/RGBA buffer drops EXIF, including GPS location.
    mode = "RGBA" if image.mode in ("RGBA", "LA", "P") else "RGB"
    image = image.convert(mode)

    stem = secrets.token_hex(12)
    root = _upload_root()

    full_name = f"{stem}.webp"
    full_path = root / full_name
    image.save(full_path, format="WEBP", quality=88, method=6)

    variants: dict[str, str] = {}
    for width in RENDITION_WIDTHS:
        if width >= image.width:
            continue
        height = round(image.height * width / image.width)
        rendition = image.resize((width, height), Image.LANCZOS)
        rendition_name = f"{stem}-{width}.webp"
        rendition.save(root / rendition_name, format="WEBP", quality=82, method=6)
        variants[str(width)] = rendition_name

    return StoredUpload(
        filename=full_name,
        mime="image/webp",
        width=image.width,
        height=image.height,
        size_bytes=full_path.stat().st_size,
        variants=variants,
    )


def store_upload(data: bytes) -> StoredUpload:
    """Validate and persist an upload. Raises InvalidUploadError on anything else."""
    if not data:
        raise InvalidUploadError("File is empty")
    if len(data) > settings.max_upload_bytes:
        raise InvalidUploadError(
            f"File exceeds the {settings.max_upload_bytes // (1024 * 1024)}MB limit"
        )
    if data.startswith(PDF_MAGIC):
        return _store_pdf(data)
    return _store_image(data)


def delete_stored(filename: str, variants: dict[str, str]) -> None:
    """Remove a file and its renditions, ignoring anything already gone."""
    root = Path(settings.upload_dir)
    for name in [filename, *variants.values()]:
        # Defend against a stored name that escapes the upload directory.
        candidate = (root / name).resolve()
        if candidate.is_relative_to(root.resolve()):
            candidate.unlink(missing_ok=True)
