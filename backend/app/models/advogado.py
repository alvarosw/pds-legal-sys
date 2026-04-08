import uuid
from datetime import datetime
from app.extensions import db


class Advogado(db.Model):
    __tablename__ = 'advogados'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome_completo = db.Column(db.String(200), nullable=False)
    numero_oab = db.Column(db.String(20), unique=True, nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    email = db.Column(db.String(150), nullable=False)
    telefone = db.Column(db.String(20))
    especialidade = db.Column(db.String(100))
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    processos = db.relationship('Processo', backref='advogado_resp', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nome_completo': self.nome_completo,
            'numero_oab': self.numero_oab,
            'cpf': self.cpf,
            'email': self.email,
            'telefone': self.telefone,
            'especialidade': self.especialidade,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat(),
            'atualizado_em': self.atualizado_em.isoformat(),
        }
