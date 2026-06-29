"""add race_name_en and race_name_ch to race_analyses

Revision ID: 002
Revises: 001
Create Date: 2026-04-14
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def _has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    return column in {c["name"] for c in inspect(bind).get_columns(table)}


def upgrade() -> None:
    if not _has_column("race_analyses", "race_name_en"):
        op.add_column("race_analyses", sa.Column("race_name_en", sa.String(), nullable=True))
    if not _has_column("race_analyses", "race_name_ch"):
        op.add_column("race_analyses", sa.Column("race_name_ch", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("race_analyses", "race_name_ch")
    op.drop_column("race_analyses", "race_name_en")
