"""Project showcase fields and settings for the role line, stats and education.

Revision ID: 0003_showcase
Revises: 0002_services
Create Date: 2026-10-18
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_showcase"
down_revision: str | None = "0002_services"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

JSON_TYPE = postgresql.JSONB(astext_type=sa.Text())


def upgrade() -> None:
    # server_default fills existing rows, then is dropped so the application
    # default is the only source going forward (same pattern as 0002).
    op.add_column(
        "project",
        sa.Column("status", sa.String(length=20), nullable=False, server_default="live"),
    )
    op.alter_column("project", "status", server_default=None)
    op.create_index(op.f("ix_project_status"), "project", ["status"])

    op.add_column(
        "project",
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.alter_column("project", "featured", server_default=None)
    op.create_index(op.f("ix_project_featured"), "project", ["featured"])

    op.add_column("project", sa.Column("tldr", sa.Text(), nullable=False, server_default=""))
    op.alter_column("project", "tldr", server_default=None)

    op.add_column(
        "project",
        sa.Column("highlight", sa.String(length=200), nullable=False, server_default=""),
    )
    op.alter_column("project", "highlight", server_default=None)

    op.add_column(
        "project", sa.Column("metrics", JSON_TYPE, nullable=False, server_default="[]")
    )
    op.alter_column("project", "metrics", server_default=None)

    op.add_column(
        "project", sa.Column("pipeline", JSON_TYPE, nullable=False, server_default="[]")
    )
    op.alter_column("project", "pipeline", server_default=None)

    op.add_column("project", sa.Column("team_size", sa.Integer(), nullable=True))

    op.add_column(
        "site_settings",
        sa.Column("title", sa.String(length=200), nullable=False, server_default=""),
    )
    op.alter_column("site_settings", "title", server_default=None)

    op.add_column(
        "site_settings", sa.Column("stats", JSON_TYPE, nullable=False, server_default="[]")
    )
    op.alter_column("site_settings", "stats", server_default=None)

    op.add_column(
        "site_settings",
        sa.Column("education", JSON_TYPE, nullable=False, server_default="[]"),
    )
    op.alter_column("site_settings", "education", server_default=None)


def downgrade() -> None:
    op.drop_column("site_settings", "education")
    op.drop_column("site_settings", "stats")
    op.drop_column("site_settings", "title")

    op.drop_column("project", "team_size")
    op.drop_column("project", "pipeline")
    op.drop_column("project", "metrics")
    op.drop_column("project", "highlight")
    op.drop_column("project", "tldr")
    op.drop_index(op.f("ix_project_featured"), table_name="project")
    op.drop_column("project", "featured")
    op.drop_index(op.f("ix_project_status"), table_name="project")
    op.drop_column("project", "status")
