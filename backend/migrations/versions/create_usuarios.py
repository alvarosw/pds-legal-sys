"""Create usuarios table

Revision ID: create_usuarios
Revises: add_devedor_to_processo
Create Date: 2026-05-24

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'create_usuarios'
down_revision = 'add_devedor_to_processo'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'usuarios',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('nome', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('senha_hash', sa.String(length=60), nullable=False),
        sa.Column('eh_admin', sa.Boolean(), nullable=False, default=False),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.Column('criado_em', sa.DateTime(), nullable=False, default=sa.func.utcnow()),
        sa.Column('atualizado_em', sa.DateTime(), nullable=False, default=sa.func.utcnow(), onupdate=sa.func.utcnow()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )


def downgrade():
    op.drop_table('usuarios')
