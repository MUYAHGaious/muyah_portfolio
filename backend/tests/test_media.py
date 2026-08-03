"""Media uploads: validation, rendition generation, and cleanup."""

import io

import pytest
from PIL import Image

from app.services.media import InvalidUploadError, store_upload
from tests.conftest import png_bytes


async def test_upload_requires_authentication(client):
    response = await client.post(
        "/api/admin/media", files={"file": ("x.png", png_bytes(), "image/png")}
    )
    assert response.status_code == 401


async def test_upload_converts_to_webp(admin_client, upload_dir):
    response = await admin_client.post(
        "/api/admin/media", files={"file": ("photo.png", png_bytes(1600, 900), "image/png")}
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["mime"] == "image/webp"
    assert payload["filename"].endswith(".webp")
    assert payload["original_name"] == "photo.png"
    assert (upload_dir / payload["filename"]).exists()


async def test_upload_generates_smaller_renditions_only(admin_client, upload_dir):
    payload = (
        await admin_client.post(
            "/api/admin/media", files={"file": ("photo.png", png_bytes(1000, 500), "image/png")}
        )
    ).json()

    # 640 is narrower than the source; 1280 and 1920 are not, so they are skipped.
    assert set(payload["variants"]) == {"640"}
    assert (upload_dir / payload["variants"]["640"]).exists()


async def test_srcset_is_ordered_widest_last(admin_client, upload_dir):
    payload = (
        await admin_client.post(
            "/api/admin/media", files={"file": ("photo.png", png_bytes(2000, 1000), "image/png")}
        )
    ).json()

    widths = [int(entry.strip().split(" ")[1].rstrip("w")) for entry in payload["srcset"].split(",")]
    assert widths == sorted(widths)
    assert widths[-1] == payload["width"]


async def test_a_renamed_text_file_is_rejected(admin_client, upload_dir):
    """The extension and content type are attacker-controlled; only the bytes are proof."""
    response = await admin_client.post(
        "/api/admin/media",
        files={"file": ("evil.png", b"<?php system($_GET['c']); ?>", "image/png")},
    )

    assert response.status_code == 400
    assert not list(upload_dir.iterdir()), "nothing should be written for a rejected upload"


async def test_oversized_upload_is_rejected(admin_client, upload_dir, monkeypatch):
    monkeypatch.setattr("app.routers.media.settings.max_upload_bytes", 1024)

    response = await admin_client.post(
        "/api/admin/media", files={"file": ("big.png", png_bytes(2000, 2000), "image/png")}
    )
    assert response.status_code == 413


async def test_pdf_is_stored_verbatim_for_the_cv(admin_client, upload_dir):
    pdf = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n"

    response = await admin_client.post(
        "/api/admin/media", files={"file": ("cv.pdf", pdf, "application/pdf")}
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["mime"] == "application/pdf"
    assert (upload_dir / payload["filename"]).read_bytes() == pdf


async def test_delete_removes_the_row_and_the_files(admin_client, upload_dir):
    payload = (
        await admin_client.post(
            "/api/admin/media", files={"file": ("photo.png", png_bytes(1000, 500), "image/png")}
        )
    ).json()
    assert list(upload_dir.iterdir())

    assert (await admin_client.delete(f"/api/admin/media/{payload['id']}")).status_code == 204

    assert (await admin_client.get("/api/admin/media")).json() == []
    assert not list(upload_dir.iterdir())


async def test_deleting_media_clears_the_reference_without_deleting_the_project(
    admin_client, upload_dir
):
    media = (
        await admin_client.post(
            "/api/admin/media", files={"file": ("photo.png", png_bytes(), "image/png")}
        )
    ).json()
    project = (
        await admin_client.post(
            "/api/admin/projects", json={"title": "With cover", "cover_image_id": media["id"]}
        )
    ).json()

    await admin_client.delete(f"/api/admin/media/{media['id']}")

    after = (await admin_client.get(f"/api/admin/projects/{project['id']}")).json()
    assert after["cover_image"] is None, "the project must survive its cover being deleted"


async def test_alt_text_can_be_set(admin_client, upload_dir):
    media = (
        await admin_client.post(
            "/api/admin/media", files={"file": ("photo.png", png_bytes(), "image/png")}
        )
    ).json()

    updated = (
        await admin_client.patch(
            f"/api/admin/media/{media['id']}", json={"alt_text": "A description"}
        )
    ).json()
    assert updated["alt_text"] == "A description"


def test_empty_upload_is_rejected(upload_dir):
    with pytest.raises(InvalidUploadError):
        store_upload(b"")


def test_exif_is_stripped(upload_dir):
    """Photos routinely carry GPS coordinates; re-encoding must discard them."""
    buffer = io.BytesIO()
    image = Image.new("RGB", (100, 100), (10, 20, 30))
    exif = image.getexif()
    exif[0x010F] = "Test Camera Manufacturer"
    image.save(buffer, format="JPEG", exif=exif)

    original = Image.open(io.BytesIO(buffer.getvalue()))
    assert dict(original.getexif()), "the fixture must actually contain EXIF"

    stored = store_upload(buffer.getvalue())
    result = Image.open(upload_dir / stored.filename)
    assert not dict(result.getexif())
