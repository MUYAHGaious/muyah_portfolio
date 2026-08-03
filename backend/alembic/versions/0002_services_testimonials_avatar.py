"""Services, testimonials, and hero avatar/greeting.

Revision ID: 0002_services
Revises: 0001_initial
Create Date: 2026-08-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_services"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

JSON_TYPE = postgresql.JSONB(astext_type=sa.Text())
TIMESTAMP = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.create_table(
        "service",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("blurb", sa.String(length=300), nullable=False),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("points", JSON_TYPE, nullable=False),
        sa.Column("image_id", sa.Integer(), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.ForeignKeyConstraint(
            ["image_id"], ["media.id"], name=op.f("fk_service_image_id_media"), ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_service")),
    )
    op.create_index(op.f("ix_service_featured"), "service", ["featured"])
    op.create_index(op.f("ix_service_sort_order"), "service", ["sort_order"])
    op.create_index(op.f("ix_service_published"), "service", ["published"])

    op.create_table(
        "testimonial",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("quote", sa.Text(), nullable=False),
        sa.Column("author", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=200), nullable=False),
        sa.Column("avatar_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("created_at", TIMESTAMP, nullable=False),
        sa.ForeignKeyConstraint(
            ["avatar_id"],
            ["media.id"],
            name=op.f("fk_testimonial_avatar_id_media"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_testimonial")),
    )
    op.create_index(op.f("ix_testimonial_sort_order"), "testimonial", ["sort_order"])
    op.create_index(op.f("ix_testimonial_published"), "testimonial", ["published"])

    # server_default fills the column for the existing settings row, then is
    # dropped so the application default is the only source going forward.
    op.add_column(
        "site_settings",
        sa.Column("greeting", sa.String(length=100), nullable=False, server_default="Hello, I'm"),
    )
    op.alter_column("site_settings", "greeting", server_default=None)

    op.add_column("site_settings", sa.Column("avatar_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        op.f("fk_site_settings_avatar_id_media"),
        "site_settings",
        "media",
        ["avatar_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_site_settings_avatar_id_media"), "site_settings", type_="foreignkey")
    op.drop_column("site_settings", "avatar_id")
    op.drop_column("site_settings", "greeting")
    op.drop_table("testimonial")
    op.drop_table("service")
