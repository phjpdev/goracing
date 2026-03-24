"""add referral_source, vip_expiry_date, age_range, price to users

Revision ID: 001
Revises:
Create Date: 2026-03-19
"""

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the enum type first
    referral_source_enum = sa.Enum(
        "FACEBOOK", "INSTAGRAM", "THREADS", name="referralsource"
    )
    referral_source_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "users",
        sa.Column("referral_source", referral_source_enum, nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("vip_expiry_date", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("age_range", sa.String(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("price", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "price")
    op.drop_column("users", "age_range")
    op.drop_column("users", "vip_expiry_date")
    op.drop_column("users", "referral_source")
    sa.Enum(name="referralsource").drop(op.get_bind(), checkfirst=True)
