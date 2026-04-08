from marshmallow import Schema, fields, validate, validates, ValidationError, pre_load
from app.utils.sanitizers import (
    sanitize_cpf_cnpj,
    validate_cpf_cnpj,
    sanitize_phone,
)


class ClienteSchema(Schema):
    id = fields.String(dump_only=True)
    nome_completo = fields.String(required=True, validate=validate.Length(min=3))
    cpf_cnpj = fields.String(required=True)
    telefone = fields.String(required=True)
    email = fields.Email(load_default=None)
    endereco = fields.String(required=True)
    observacoes = fields.String(load_default=None)
    ativo = fields.Boolean(dump_only=True)
    criado_em = fields.DateTime(dump_only=True)
    atualizado_em = fields.DateTime(dump_only=True)

    @pre_load
    def sanitize_data(self, data, **kwargs):
        if 'cpf_cnpj' in data:
            data['cpf_cnpj'] = sanitize_cpf_cnpj(data['cpf_cnpj'])
        if 'telefone' in data:
            data['telefone'] = sanitize_phone(data['telefone'])
        return data

    @validates('cpf_cnpj')
    def validate_cpf_cnpj(self, value):
        if not validate_cpf_cnpj(value):
            raise ValidationError('CPF/CNPJ inválido.')


class ClienteCreateSchema(ClienteSchema):
    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')


class ClienteUpdateSchema(ClienteSchema):
    nome_completo = fields.String(validate=validate.Length(min=3))
    cpf_cnpj = fields.String()
    telefone = fields.String()
    endereco = fields.String()

    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')
