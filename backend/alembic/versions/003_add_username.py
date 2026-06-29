"""add username column and make email nullable

Revision ID: 003
Revises: 002
Create Date: 2026-06-29
"""

from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(), nullable=True))
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
    op.alter_column("users", "email", existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.alter_column("users", "email", existing_type=sa.String(), nullable=False)
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_column("users", "username")
