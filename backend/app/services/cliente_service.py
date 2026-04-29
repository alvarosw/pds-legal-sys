from flask import jsonify, request
from app.schemas.cliente import ClienteSchema, ClienteCreateSchema, ClienteUpdateSchema
from app.repositories.cliente_repo import ClienteRepository
from app.models.processo import Processo
from app.utils.sanitizers import sanitize_cpf_cnpj


cliente_schema = ClienteSchema()
clientes_schema = ClienteSchema(many=True)
cliente_create_schema = ClienteCreateSchema()
cliente_update_schema = ClienteUpdateSchema()


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


def get_clientes():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q')
    sort = request.args.get('sort', 'nome_completo')
    order = request.args.get('order', 'asc')
    include_inactive = request.args.get('include_inactive', False, type=bool)

    pagination = ClienteRepository.get_all(
        page=page, per_page=per_page, search=q, sort=sort, order=order, include_inactive=include_inactive
    )
    return jsonify(paginate_response(clientes_schema.dump(pagination.items), pagination)), 200


def get_cliente(id):
    include_inactive = request.args.get('include_inactive', False, type=bool)
    cliente = ClienteRepository.get_by_id(id, include_inactive=include_inactive)
    if not cliente:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Cliente não encontrado.'}}), 404
    return jsonify(cliente_schema.dump(cliente)), 200


def create_cliente():
    try:
        data = request.get_json()
        errors = cliente_create_schema.validate(data)
        if errors:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

        sanitized_cpf = sanitize_cpf_cnpj(data.get('cpf_cnpj'))
        existing = ClienteRepository.get_by_cpf_cnpj(sanitized_cpf)
        if existing:
            return jsonify({'error': {'code': 'CONFLICT', 'message': 'Cliente já cadastrado.'}}), 409

        validated = cliente_create_schema.load(data)
        cliente = ClienteRepository.create(validated)
        return jsonify(cliente_schema.dump(cliente)), 201
    except Exception as e:
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': str(e)}}), 500


def update_cliente(id):
    cliente = ClienteRepository.get_by_id(id)
    if not cliente:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Cliente não encontrado.'}}), 404

    data = request.get_json()
    errors = cliente_update_schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

    if 'cpf_cnpj' in data and data['cpf_cnpj'] != cliente.cpf_cnpj:
        existing = ClienteRepository.get_by_cpf_cnpj(data['cpf_cnpj'])
        if existing:
            return jsonify({'error': {'code': 'CONFLICT', 'message': 'CPF/CNPJ já cadastrado.'}}), 409

    validated = cliente_update_schema.load(data)
    cliente = ClienteRepository.update(cliente, validated)
    return jsonify(cliente_schema.dump(cliente)), 200


def deactivate_cliente(id):
    cliente = ClienteRepository.get_by_id(id)
    if not cliente:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Cliente não encontrado.'}}), 404

    # RF004: Verificar se há processos ativos vinculados
    processos_ativos = Processo.query.filter_by(cliente_id=id, ativo=True).all()
    if processos_ativos:
        return jsonify({
            'error': {
                'code': 'CONFLICT',
                'message': f'Não é possível desativar: existem {len(processos_ativos)} processo(s) ativo(s) vinculado(s).'
            }
        }), 409

    cliente = ClienteRepository.deactivate(cliente)
    return jsonify(cliente_schema.dump(cliente)), 200


def reactivate_cliente(id):
    cliente = ClienteRepository.get_by_id(id, include_inactive=True)
    if not cliente:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Cliente não encontrado.'}}), 404

    if cliente.ativo:
        return jsonify({'error': {'code': 'CONFLICT', 'message': 'Cliente já está ativo.'}}), 409

    cliente = ClienteRepository.reactivate(cliente)
    return jsonify(cliente_schema.dump(cliente)), 200
