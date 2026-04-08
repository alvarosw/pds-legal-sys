from flask import jsonify, request
from app.schemas.processo import ProcessoSchema, ProcessoCreateSchema, ProcessoUpdateSchema
from app.repositories.processo_repo import ProcessoRepository
from app.models.cliente import Cliente
from app.models.advogado import Advogado
from app.models.devedor import Devedor
from datetime import datetime


processo_schema = ProcessoSchema()
processos_schema = ProcessoSchema(many=True)
processo_create_schema = ProcessoCreateSchema()
processo_update_schema = ProcessoUpdateSchema()


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


def get_processos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q')
    sort = request.args.get('sort', 'numero_processo')
    order = request.args.get('order', 'asc')

    pagination = ProcessoRepository.get_all(
        page=page, per_page=per_page, search=q, sort=sort, order=order
    )
    return jsonify(paginate_response(processos_schema.dump(pagination.items), pagination)), 200


def get_processo(id):
    processo = ProcessoRepository.get_by_id(id)
    if not processo:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Processo não encontrado.'}}), 404
    return jsonify(processo_schema.dump(processo)), 200


def create_processo():
    data = request.get_json()
    errors = processo_create_schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

    existing = ProcessoRepository.get_by_numero(data.get('numero_processo'))
    if existing:
        return jsonify({'error': {'code': 'CONFLICT', 'message': 'Processo já cadastrado.'}}), 409

    # Validar que cliente existe
    if 'cliente_id' in data:
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Cliente não encontrado.'}}), 404

    # Validar que advogado existe (se informado)
    if 'advogado_resp_id' in data and data['advogado_resp_id']:
        advogado = Advogado.query.get(data['advogado_resp_id'])
        if not advogado:
            return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Advogado não encontrado.'}}), 404

    validated = processo_create_schema.load(data)
    processo = ProcessoRepository.create(validated)
    return jsonify(processo_schema.dump(processo)), 201


def update_processo(id):
    processo = ProcessoRepository.get_by_id(id)
    if not processo:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Processo não encontrado.'}}), 404

    data = request.get_json()
    errors = processo_update_schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

    if 'numero_processo' in data and data['numero_processo'] != processo.numero_processo:
        existing = ProcessoRepository.get_by_numero(data['numero_processo'])
        if existing:
            return jsonify({'error': {'code': 'CONFLICT', 'message': 'Processo já cadastrado.'}}), 409

    # Validar que cliente existe
    if 'cliente_id' in data:
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Cliente não encontrado.'}}), 404

    # Validar que advogado existe (se informado)
    if 'advogado_resp_id' in data and data['advogado_resp_id']:
        advogado = Advogado.query.get(data['advogado_resp_id'])
        if not advogado:
            return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Advogado não encontrado.'}}), 404

    validated = processo_update_schema.load(data)
    processo = ProcessoRepository.update(processo, validated)
    return jsonify(processo_schema.dump(processo)), 200


def deactivate_processo(id):
    processo = ProcessoRepository.get_by_id(id)
    if not processo:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Processo não encontrado.'}}), 404

    # RF008: Verificar se há devedores ativos vinculados (pendências)
    devedores_ativos = Devedor.query.filter_by(processo_id=id, ativo=True).all()
    if devedores_ativos:
        return jsonify({
            'error': {
                'code': 'CONFLICT',
                'message': f'Não é possível encerrar: existem {len(devedores_ativos)} devedor(es) ativo(s) vinculado(s).'
            }
        }), 409

    processo = ProcessoRepository.deactivate(processo)
    return jsonify(processo_schema.dump(processo)), 200
