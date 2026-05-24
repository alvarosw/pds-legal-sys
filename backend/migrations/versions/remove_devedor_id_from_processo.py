"""Remove devedor_id from processos table

Revision ID: remove_devedor_id_from_processo
Revises: add_devedor_to_processo
Create Date: 2026-05-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'remove_devedor_id_from_processo'
down_revision = 'create_usuarios'
branch_labels = None
depends_on = None


def upgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_processos_devedor_id', 'processos', type_='foreignkey')

    # Remove devedor_id column
    op.drop_column('processos', 'devedor_id')


def downgrade():
    # Add devedor_id column back
    op.add_column('processos', sa.Column('devedor_id', sa.String(36), nullable=True))

    # Create foreign key constraint
    op.create_foreign_key(
        'fk_processos_devedor_id',
        'processos',
        'devedores',
        ['devedor_id'],
        ['id']
    )
