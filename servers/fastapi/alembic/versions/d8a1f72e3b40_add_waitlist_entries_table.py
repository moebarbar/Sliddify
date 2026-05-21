"""add_waitlist_entries_table

Revision ID: d8a1f72e3b40
Revises: c7b70d0f31b1
Create Date: 2026-05-20 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'd8a1f72e3b40'
down_revision: Union[str, None] = 'c7b70d0f31b1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(table_name: str) -> bool:
    return table_name in sa.inspect(op.get_bind()).get_table_names()


def _has_index(table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    if table_name not in inspector.get_table_names():
        return False
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    if not _has_table('waitlist_entries'):
        op.create_table(
            'waitlist_entries',
            sa.Column('id', sa.Uuid(), nullable=False),
            sa.Column('email', sa.String(length=320), nullable=False),
            sa.Column('source', sa.String(length=64), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('email', name='uq_waitlist_entries_email'),
        )
    if not _has_index('waitlist_entries', op.f('ix_waitlist_entries_email')):
        op.create_index(
            op.f('ix_waitlist_entries_email'),
            'waitlist_entries',
            ['email'],
            unique=True,
        )


def downgrade() -> None:
    if _has_index('waitlist_entries', op.f('ix_waitlist_entries_email')):
        op.drop_index(
            op.f('ix_waitlist_entries_email'),
            table_name='waitlist_entries',
        )
    if _has_table('waitlist_entries'):
        op.drop_table('waitlist_entries')
