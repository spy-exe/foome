"""address extra fields (label, neighborhood, cep, reference)

Revision ID: a1b2c3d4e5f6
Revises: 093e1801fec5
Create Date: 2026-06-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '093e1801fec5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('addresses', sa.Column('label', sa.String(length=40), nullable=True))
    op.add_column('addresses', sa.Column('neighborhood', sa.String(length=120), nullable=True))
    op.add_column('addresses', sa.Column('cep', sa.String(length=9), nullable=True))
    op.add_column('addresses', sa.Column('reference', sa.String(length=160), nullable=True))


def downgrade() -> None:
    op.drop_column('addresses', 'reference')
    op.drop_column('addresses', 'cep')
    op.drop_column('addresses', 'neighborhood')
    op.drop_column('addresses', 'label')
