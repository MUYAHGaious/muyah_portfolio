from datetime import datetime

from pydantic import computed_field

from app.schemas.common import ORMModel

UPLOAD_URL_PREFIX = "/uploads"


class MediaOut(ORMModel):
    id: int
    filename: str
    original_name: str
    alt_text: str
    mime: str
    width: int
    height: int
    size_bytes: int
    variants: dict[str, str]
    created_at: datetime

    @computed_field
    @property
    def url(self) -> str:
        return f"{UPLOAD_URL_PREFIX}/{self.filename}"

    @computed_field
    @property
    def srcset(self) -> str:
        """A ready-to-use `srcset` string, widest last."""
        parts = [
            f"{UPLOAD_URL_PREFIX}/{name} {width}w"
            for width, name in sorted(self.variants.items(), key=lambda kv: int(kv[0]))
        ]
        parts.append(f"{UPLOAD_URL_PREFIX}/{self.filename} {self.width}w")
        return ", ".join(parts)


class MediaUpdate(ORMModel):
    alt_text: str = ""
