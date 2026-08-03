"""SQLAlchemy models.

Every model must be imported here so that `Base.metadata` is complete before
Alembic autogenerates a migration or the test suite creates tables.
"""

from app.models.analytics import PageView
from app.models.experience import Experience
from app.models.media import Media
from app.models.message import Message
from app.models.post import Post
from app.models.project import Project
from app.models.settings import SINGLETON_ID, SiteSettings
from app.models.user import AdminUser

__all__ = [
    "SINGLETON_ID",
    "AdminUser",
    "Experience",
    "Media",
    "Message",
    "PageView",
    "Post",
    "Project",
    "SiteSettings",
]
