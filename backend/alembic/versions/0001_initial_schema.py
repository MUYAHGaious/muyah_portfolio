"""Initial schema.

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Matches JSONType in app.core.db, which resolves to JSONB on Postgres.
JSON_TYPE = postgresql.JSONB(astext_type=sa.Text())
TIMESTAMP = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.create_table(
        "admin_user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_admin_user")),
    )
    op.create_index(op.f("ix_admin_user_email"), "admin_user", ["email"], unique=True)

    op.create_table(
        "media",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("original_name", sa.String(length=255), nullable=False),
        sa.Column("alt_text", sa.String(length=500), nullable=False),
        sa.Column("mime", sa.String(length=100), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("variants", JSON_TYPE, nullable=False),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_media")),
        sa.UniqueConstraint("filename", name=op.f("uq_media_filename")),
    )

    op.create_table(
        "project",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=200), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.String(length=500), nullable=False),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("role", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("tech", JSON_TYPE, nullable=False),
        sa.Column("links", JSON_TYPE, nullable=False),
        sa.Column("cover_image_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.Column("updated_at", TIMESTAMP, nullable=False),
        sa.ForeignKeyConstraint(
            ["cover_image_id"],
            ["media.id"],
            name=op.f("fk_project_cover_image_id_media"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_project")),
    )
    op.create_index(op.f("ix_project_slug"), "project", ["slug"], unique=True)
    op.create_index(op.f("ix_project_category"), "project", ["category"])
    op.create_index(op.f("ix_project_sort_order"), "project", ["sort_order"])
    op.create_index(op.f("ix_project_published"), "project", ["published"])

    op.create_table(
        "experience",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=200), nullable=False),
        sa.Column("company", sa.String(length=200), nullable=False),
        sa.Column("location", sa.String(length=200), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("highlights", JSON_TYPE, nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_experience")),
    )
    op.create_index(op.f("ix_experience_sort_order"), "experience", ["sort_order"])
    op.create_index(op.f("ix_experience_published"), "experience", ["published"])

    op.create_table(
        "post",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=200), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("excerpt", sa.String(length=500), nullable=False),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("tags", JSON_TYPE, nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("published_at", TIMESTAMP, nullable=True),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.Column("updated_at", TIMESTAMP, nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_post")),
    )
    op.create_index(op.f("ix_post_slug"), "post", ["slug"], unique=True)
    op.create_index(op.f("ix_post_published"), "post", ["published"])
    op.create_index(op.f("ix_post_published_at"), "post", ["published_at"])

    op.create_table(
        "message",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=300), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("ip_hash", sa.String(length=64), nullable=False),
        sa.Column("read_at", TIMESTAMP, nullable=True),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_message")),
    )
    op.create_index(op.f("ix_message_ip_hash"), "message", ["ip_hash"])
    op.create_index(op.f("ix_message_created_at"), "message", ["created_at"])

    op.create_table(
        "page_view",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("path", sa.String(length=500), nullable=False),
        sa.Column("referrer", sa.String(length=500), nullable=False),
        sa.Column("visitor_hash", sa.String(length=64), nullable=False),
        sa.Column("country", sa.String(length=2), nullable=False),
        sa.Column("device", sa.String(length=20), nullable=False),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_page_view")),
    )
    op.create_index(op.f("ix_page_view_path"), "page_view", ["path"])
    op.create_index(op.f("ix_page_view_visitor_hash"), "page_view", ["visitor_hash"])
    op.create_index(op.f("ix_page_view_day"), "page_view", ["day"])

    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("tagline", sa.String(length=300), nullable=False),
        sa.Column("bio_md", sa.Text(), nullable=False),
        sa.Column("location", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("socials", JSON_TYPE, nullable=False),
        sa.Column("resume_media_id", sa.Integer(), nullable=True),
        sa.Column("updated_at", TIMESTAMP, nullable=False),
        sa.ForeignKeyConstraint(
            ["resume_media_id"],
            ["media.id"],
            name=op.f("fk_site_settings_resume_media_id_media"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_site_settings")),
    )


def downgrade() -> None:
    op.drop_table("site_settings")
    op.drop_table("page_view")
    op.drop_table("message")
    op.drop_table("post")
    op.drop_table("experience")
    op.drop_table("project")
    op.drop_table("media")
    op.drop_table("admin_user")
