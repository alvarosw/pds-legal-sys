from flask import jsonify, request
from app.schemas.devedor import DevedorSchema, DevedorCreateSchema, DevedorUpdateSchema
from app.repositories.devedor_repo import DevedorRepository
from app.models.processo import Processo
from datetime import datetime


devedor_schema = DevedorSchema()
devedores_schema = DevedorSchema(many=True)
devedor_create_schema = DevedorCreateSchema()
devedor_update_schema = DevedorUpdateSchema()


def paginate_response(items, pagination):
    return {
        'data': items,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
        }
    }


def get_devedores():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q')
    sort = request.args.get('sort', 'nome_razao_social')
    order = request.args.get('order', 'asc')
    include_inactive = request.args.get('include_inactive', False, type=bool)

    pagination = DevedorRepository.get_all(
        page=page, per_page=per_page, search=q, sort=sort, order=order, include_inactive=include_inactive
    )
    return jsonify(paginate_response(devedores_schema.dump(pagination.items), pagination)), 200


def get_devedor(id):
    include_inactive = request.args.get('include_inactive', False, type=bool)
    devedor = DevedorRepository.get_by_id(id, include_inactive=include_inactive)
    if not devedor:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Devedor não encontrado.'}}), 404
    return jsonify(devedor_schema.dump(devedor)), 200


def create_devedor():
    data = request.get_json()
    errors = devedor_create_schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

    existing = DevedorRepository.get_by_cpf_cnpj(data.get('cpf_cnpj'))
    if existing:
        return jsonify({'error': {'code': 'CONFLICT', 'message': 'Devedor já cadastrado.'}}), 409

    # Validação: data da dívida não pode ser futura
    if 'data_divida' in data:
        data_divida = datetime.strptime(data['data_divida'], '%Y-%m-%d').date()
        if data_divida > datetime.now().date():
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Data da dívida não pode ser futura.'}}), 400

    validated = devedor_create_schema.load(data)
    devedor = DevedorRepository.create(validated)
    return jsonify(devedor_schema.dump(devedor)), 201


def update_devedor(id):
    devedor = DevedorRepository.get_by_id(id)
    if not devedor:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Devedor não encontrado.'}}), 404

    data = request.get_json()
    errors = devedor_update_schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

    if 'cpf_cnpj' in data and data['cpf_cnpj'] != devedor.cpf_cnpj:
        existing = DevedorRepository.get_by_cpf_cnpj(data['cpf_cnpj'])
        if existing:
            return jsonify({'error': {'code': 'CONFLICT', 'message': 'CPF/CNPJ já cadastrado.'}}), 409

    # Validação: data da dívida não pode ser futura
    if 'data_divida' in data:
        data_divida = datetime.strptime(data['data_divida'], '%Y-%m-%d').date()
        if data_divida > datetime.now().date():
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Data da dívida não pode ser futura.'}}), 400

    validated = devedor_update_schema.load(data)
    devedor = DevedorRepository.update(devedor, validated)
    return jsonify(devedor_schema.dump(devedor)), 200


def deactivate_devedor(id):
    devedor = DevedorRepository.get_by_id(id)
    if not devedor:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Devedor não encontrado.'}}), 404

    # RF012: Verificar se há vínculos ativos (processo vinculado ativo ou cobranças/acordos)
    if devedor.processo_id:
        processo_vinculado = Processo.query.filter_by(id=devedor.processo_id, ativo=True).first()
        if processo_vinculado:
            return jsonify({
                'error': {
                    'code': 'CONFLICT',
                    'message': 'Não é possível desativar: existe processo ativo vinculado a este devedor.'
                }
            }), 409

    devedor = DevedorRepository.deactivate(devedor)
    return jsonify(devedor_schema.dump(devedor)), 200


def reactivate_devedor(id):
    devedor = DevedorRepository.get_by_id(id, include_inactive=True)
    if not devedor:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Devedor não encontrado.'}}), 404

    if devedor.ativo:
        return jsonify({'error': {'code': 'CONFLICT', 'message': 'Devedor já está ativo.'}}), 409

    devedor = DevedorRepository.reactivate(devedor)
    return jsonify(devedor_schema.dump(devedor)), 200
