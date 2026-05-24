from marshmallow import Schema, fields, validate, validates, ValidationError, pre_load
import re


class UsuarioSchema(Schema):
    id = fields.String(dump_only=True)
    nome = fields.String(required=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(required=True)
    eh_admin = fields.Boolean(dump_only=True, default=False)
    ativo = fields.Boolean(dump_only=True)
    criado_em = fields.DateTime(dump_only=True)
    atualizado_em = fields.DateTime(dump_only=True)

    @validates('email')
    def validate_email(self, value):
        if not value or not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
            raise ValidationError('E-mail inválido.')


class UsuarioCreateSchema(UsuarioSchema):
    senha = fields.String(required=True, load_only=True, validate=validate.Length(min=8))

    class Meta:
        exclude = ('id', 'eh_admin', 'ativo', 'criado_em', 'atualizado_em')


class LoginSchema(Schema):
    email = fields.Email(required=True)
    senha = fields.String(required=True)
