"""Add devedor_id to processos table

Revision ID: add_devedor_to_processo
Revises: sanitize_numeric
Create Date: 2026-05-21

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_devedor_to_processo'
down_revision = 'sanitize_numeric'
branch_labels = None
depends_on = None


def upgrade():
    # Add devedor_id column to processos table
    op.add_column('processos', sa.Column('devedor_id', sa.String(36), nullable=True))

    # Create foreign key constraint
    op.create_foreign_key(
        'fk_processos_devedor_id',
        'processos',
        'devedores',
        ['devedor_id'],
        ['id']
    )


def downgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_processos_devedor_id', 'processos', type_='foreignkey')

    # Remove devedor_id column
    op.drop_column('processos', 'devedor_id')
