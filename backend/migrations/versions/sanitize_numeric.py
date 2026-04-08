"""Sanitize numeric fields

Revision ID: sanitize_numeric
Revises: initial
Create Date: 2026-04-07

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'sanitize_numeric'
down_revision = 'initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Remove pontuações de campos numéricos existentes."""
    conn = op.get_bind()
    
    # Clientes: sanitizar cpf_cnpj e telefone
    conn.execute(sa.text("""
        UPDATE clientes
        SET cpf_cnpj = regexp_replace(cpf_cnpj, '\D', '', 'g'),
            telefone = regexp_replace(telefone, '\D', '', 'g')
        WHERE cpf_cnpj ~ '\D' OR telefone ~ '\D'
    """))
    
    # Advogados: sanitizar cpf, telefone e numero_oab
    conn.execute(sa.text("""
        UPDATE advogados
        SET cpf = regexp_replace(cpf, '\D', '', 'g'),
            telefone = regexp_replace(telefone, '\D', '', 'g'),
            numero_oab = regexp_replace(numero_oab, '\s', '', 'g')
        WHERE cpf ~ '\D' OR telefone ~ '\D' OR numero_oab ~ '\s'
    """))


def downgrade() -> None:
    """Não há reversão segura para adicionar pontuações."""
    pass
