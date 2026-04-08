import uuid
from datetime import datetime, date
from app.extensions import db


class Devedor(db.Model):
    __tablename__ = 'devedores'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome_razao_social = db.Column(db.String(200), nullable=False)
    cpf_cnpj = db.Column(db.String(18), unique=True, nullable=False)
    valor_divida = db.Column(db.Numeric(12, 2), nullable=False)
    data_divida = db.Column(db.Date, nullable=False)
    origem_descricao = db.Column(db.Text, nullable=False)
    contato = db.Column(db.String(150))
    processo_id = db.Column(db.String(36), db.ForeignKey('processos.id'))
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nome_razao_social': self.nome_razao_social,
            'cpf_cnpj': self.cpf_cnpj,
            'valor_divida': float(self.valor_divida),
            'data_divida': self.data_divida.isoformat() if self.data_divida else None,
            'origem_descricao': self.origem_descricao,
            'contato': self.contato,
            'processo_id': self.processo_id,
            'observacoes': self.observacoes,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat(),
            'atualizado_em': self.atualizado_em.isoformat(),
        }
