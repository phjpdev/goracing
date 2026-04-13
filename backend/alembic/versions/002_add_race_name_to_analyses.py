"""add race_name_en and race_name_ch to race_analyses

Revision ID: 002
Revises: 001
Create Date: 2026-04-14
"""

from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("race_analyses", sa.Column("race_name_en", sa.String(), nullable=True))
    op.add_column("race_analyses", sa.Column("race_name_ch", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("race_analyses", "race_name_ch")
    op.drop_column("race_analyses", "race_name_en")
