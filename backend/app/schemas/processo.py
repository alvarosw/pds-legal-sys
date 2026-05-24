from datetime import datetime
from marshmallow import Schema, fields, validate, validates, ValidationError


class ProcessoSchema(Schema):
    id = fields.String(dump_only=True)
    numero_processo = fields.String(required=True)
    tipo = fields.String(required=True)
    cliente_id = fields.String(required=True)
    data_abertura = fields.Date(required=True)
    vara_comarca = fields.String(required=True)
    status = fields.String(
        required=True,
        validate=validate.OneOf(['Aberto', 'Em Andamento', 'Suspenso', 'Encerrado', 'Arquivado'])
    )
    advogado_resp_id = fields.String(load_default=None)
    valor_causa = fields.Decimal(load_default=None)
    observacoes = fields.String(load_default=None)
    ativo = fields.Boolean(dump_only=True)
    criado_em = fields.DateTime(dump_only=True)
    atualizado_em = fields.DateTime(dump_only=True)


class ProcessoCreateSchema(ProcessoSchema):
    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')


class ProcessoUpdateSchema(ProcessoSchema):
    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')
