"""empty message

Revision ID: initial
Revises: 
Create Date: 2026-04-07 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('clientes',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('nome_completo', sa.String(200), nullable=False),
        sa.Column('cpf_cnpj', sa.String(18), nullable=False),
        sa.Column('telefone', sa.String(20), nullable=False),
        sa.Column('email', sa.String(150), nullable=True),
        sa.Column('endereco', sa.Text(), nullable=False),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False),
        sa.Column('criado_em', sa.DateTime(), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cpf_cnpj')
    )
    op.create_table('advogados',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('nome_completo', sa.String(200), nullable=False),
        sa.Column('numero_oab', sa.String(20), nullable=False),
        sa.Column('cpf', sa.String(14), nullable=False),
        sa.Column('email', sa.String(150), nullable=False),
        sa.Column('telefone', sa.String(20), nullable=True),
        sa.Column('especialidade', sa.String(100), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False),
        sa.Column('criado_em', sa.DateTime(), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cpf'),
        sa.UniqueConstraint('numero_oab')
    )
    op.create_table('processos',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('numero_processo', sa.String(50), nullable=False),
        sa.Column('tipo', sa.String(100), nullable=False),
        sa.Column('cliente_id', sa.String(36), nullable=False),
        sa.Column('data_abertura', sa.Date(), nullable=False),
        sa.Column('vara_comarca', sa.String(150), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('advogado_resp_id', sa.String(36), nullable=True),
        sa.Column('valor_causa', sa.Numeric(12, 2), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False),
        sa.Column('criado_em', sa.DateTime(), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['advogado_resp_id'], ['advogados.id'], ),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero_processo')
    )
    op.create_table('devedores',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('nome_razao_social', sa.String(200), nullable=False),
        sa.Column('cpf_cnpj', sa.String(18), nullable=False),
        sa.Column('valor_divida', sa.Numeric(12, 2), nullable=False),
        sa.Column('data_divida', sa.Date(), nullable=False),
        sa.Column('origem_descricao', sa.Text(), nullable=False),
        sa.Column('contato', sa.String(150), nullable=True),
        sa.Column('processo_id', sa.String(36), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False),
        sa.Column('criado_em', sa.DateTime(), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['processo_id'], ['processos.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cpf_cnpj')
    )


def downgrade():
    op.drop_table('devedores')
    op.drop_table('processos')
    op.drop_table('advogados')
    op.drop_table('clientes')
