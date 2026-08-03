import re

from pydantic import BaseModel, ConfigDict

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def slugify(value: str) -> str:
    """Derive a URL slug from a title. Falls back to 'untitled' if nothing survives."""
    lowered = value.strip().lower()
    cleaned = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    return cleaned or "untitled"


class Page(BaseModel):
    """Envelope for paginated list responses."""

    items: list
    total: int
    page: int
    per_page: int

    @property
    def pages(self) -> int:
        return max(1, -(-self.total // self.per_page))
