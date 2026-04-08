import uuid
from datetime import datetime
from app.extensions import db


class Cliente(db.Model):
    __tablename__ = 'clientes'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome_completo = db.Column(db.String(200), nullable=False)
    cpf_cnpj = db.Column(db.String(18), unique=True, nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(150))
    endereco = db.Column(db.Text, nullable=False)
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    processos = db.relationship('Processo', backref='cliente', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nome_completo': self.nome_completo,
            'cpf_cnpj': self.cpf_cnpj,
            'telefone': self.telefone,
            'email': self.email,
            'endereco': self.endereco,
            'observacoes': self.observacoes,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat(),
            'atualizado_em': self.atualizado_em.isoformat(),
        }
