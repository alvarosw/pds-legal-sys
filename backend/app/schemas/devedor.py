from marshmallow import Schema, fields, validate, validates, ValidationError, pre_load
from app.utils.sanitizers import sanitize_cpf_cnpj, validate_cpf_cnpj


class DevedorSchema(Schema):
    id = fields.String(dump_only=True)
    nome_razao_social = fields.String(required=True, validate=validate.Length(min=3))
    cpf_cnpj = fields.String(required=True)
    valor_divida = fields.Decimal(required=True, places=2, validate=validate.Range(min=0.01))
    data_divida = fields.Date(required=True)
    origem_descricao = fields.String(required=True, validate=validate.Length(min=5))
    contato = fields.String(load_default=None)
    processo_id = fields.String(load_default=None)
    observacoes = fields.String(load_default=None)
    ativo = fields.Boolean(dump_only=True)
    criado_em = fields.DateTime(dump_only=True)
    atualizado_em = fields.DateTime(dump_only=True)

    @pre_load
    def sanitize_data(self, data, **kwargs):
        if 'cpf_cnpj' in data:
            data['cpf_cnpj'] = sanitize_cpf_cnpj(data['cpf_cnpj'])
        return data

    @validates('cpf_cnpj')
    def validate_cpf_cnpj(self, value):
        if not validate_cpf_cnpj(value):
            raise ValidationError('CPF/CNPJ inválido.')


class DevedorCreateSchema(DevedorSchema):
    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')


class DevedorUpdateSchema(DevedorSchema):
    nome_razao_social = fields.String(validate=validate.Length(min=3))
    cpf_cnpj = fields.String()
    valor_divida = fields.Decimal(places=2, validate=validate.Range(min=0.01))
    data_divida = fields.Date()
    origem_descricao = fields.String(validate=validate.Length(min=5))

    class Meta:
        exclude = ('id', 'ativo', 'criado_em', 'atualizado_em')
