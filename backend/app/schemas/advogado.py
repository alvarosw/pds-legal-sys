from marshmallow import Schema, fields, validate, validates, ValidationError, pre_load
from app.utils.sanitizers import (
    sanitize_cpf_cnpj,
    validate_cpf_cnpj,
    sanitize_phone,
    sanitize_oab,
)


class AdvogadoSchema(Schema):
    id = fields.String(dump_only=True)
    nome_completo = fields.String(required=True, validate=validate.Length(min=3))
    numero_oab = fields.String(required=True)
    cpf = fields.String(required=True)
    email = fields.Email(required=True)
    telefone = fields.String(load_default=None)
    especialidade = fields.String(load_default=None)
    ativo = fields.Boolean(dump_only=True)
    criado_em = fields.DateTime(dump_only=True)
    atualizado_em = fields.DateTime(dump_only=True)

    @pre_load
    def sanitize_data(self, data, **kwargs):
        if 'cpf' in data:
            data['cpf'] = sanitize_cpf_cnpj(data['cpf'])
        if 'telefone' in data:
            data['telefone'] = sanitize_phone(data['telefone'])
        if 'numero_oab' in data:
            data['numero_oab'] = sanitize_oab(data['numero_oab'])
        return data

    @validates('cpf')
    def validate_cpf(self, value):
        if not validate_cpf_cnpj(value):
            raise ValidationError('CPF inválido.')


class AdvogadoCreateSchema(AdvogadoSchema):
    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')


class AdvogadoUpdateSchema(AdvogadoSchema):
    nome_completo = fields.String(validate=validate.Length(min=3))
    numero_oab = fields.String()
    cpf = fields.String()
    email = fields.Email()

    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')
