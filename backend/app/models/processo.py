import uuid
from datetime import datetime, date
from app.extensions import db


class Processo(db.Model):
    __tablename__ = 'processos'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    numero_processo = db.Column(db.String(50), unique=True, nullable=False)
    tipo = db.Column(db.String(100), nullable=False)
    cliente_id = db.Column(db.String(36), db.ForeignKey('clientes.id'), nullable=False)
    data_abertura = db.Column(db.Date, nullable=False)
    vara_comarca = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Aberto')
    advogado_resp_id = db.Column(db.String(36), db.ForeignKey('advogados.id'))
    valor_causa = db.Column(db.Numeric(12, 2))
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    devedores = db.relationship('Devedor', backref='processo', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'numero_processo': self.numero_processo,
            'tipo': self.tipo,
            'cliente_id': self.cliente_id,
            'data_abertura': self.data_abertura.isoformat() if self.data_abertura else None,
            'vara_comarca': self.vara_comarca,
            'status': self.status,
            'advogado_resp_id': self.advogado_resp_id,
            'valor_causa': float(self.valor_causa) if self.valor_causa else None,
            'observacoes': self.observacoes,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat(),
            'atualizado_em': self.atualizado_em.isoformat(),
        }
