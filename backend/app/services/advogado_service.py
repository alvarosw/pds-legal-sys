from flask import jsonify, request
from app.extensions import db
from app.schemas.advogado import AdvogadoSchema, AdvogadoCreateSchema, AdvogadoUpdateSchema
from app.repositories.advogado_repo import AdvogadoRepository
from app.models.processo import Processo


advogado_schema = AdvogadoSchema()
advogados_schema = AdvogadoSchema(many=True)
advogado_create_schema = AdvogadoCreateSchema()
advogado_update_schema = AdvogadoUpdateSchema()


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


def get_advogados():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q')
    sort = request.args.get('sort', 'nome_completo')
    order = request.args.get('order', 'asc')
    include_inactive = request.args.get('include_inactive', False, type=bool)

    pagination = AdvogadoRepository.get_all(
        page=page, per_page=per_page, search=q, sort=sort, order=order, include_inactive=include_inactive
    )
    return jsonify(paginate_response(advogados_schema.dump(pagination.items), pagination)), 200


def get_advogado(id):
    include_inactive = request.args.get('include_inactive', False, type=bool)
    advogado = AdvogadoRepository.get_by_id(id, include_inactive=include_inactive)
    if not advogado:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Advogado não encontrado.'}}), 404
    return jsonify(advogado_schema.dump(advogado)), 200


def create_advogado():
    data = request.get_json()
    errors = advogado_create_schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

    existing = AdvogadoRepository.get_by_oab(data.get('numero_oab'))
    if existing:
        return jsonify({'error': {'code': 'CONFLICT', 'message': 'OAB já cadastrada.'}}), 409

    validated = advogado_create_schema.load(data)
    advogado = AdvogadoRepository.create(validated)
    return jsonify(advogado_schema.dump(advogado)), 201


def update_advogado(id):
    advogado = AdvogadoRepository.get_by_id(id)
    if not advogado:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Advogado não encontrado.'}}), 404

    data = request.get_json()
    errors = advogado_update_schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

    if 'numero_oab' in data and data['numero_oab'] != advogado.numero_oab:
        existing = AdvogadoRepository.get_by_oab(data['numero_oab'])
        if existing:
            return jsonify({'error': {'code': 'CONFLICT', 'message': 'OAB já cadastrada.'}}), 409

    validated = advogado_update_schema.load(data)
    advogado = AdvogadoRepository.update(advogado, validated)
    return jsonify(advogado_schema.dump(advogado)), 200


def deactivate_advogado(id):
    try:
        advogado = AdvogadoRepository.get_by_id(id)
        if not advogado:
            return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Advogado não encontrado.'}}), 404

        # Verificar se há processos ativos vinculados
        processos_ativos = Processo.query.filter_by(advogado_resp_id=id, ativo=True).all()
        if processos_ativos:
            return jsonify({
                'error': {
                    'code': 'CONFLICT',
                    'message': f'Não é possível desativar: existem {len(processos_ativos)} processo(s) ativo(s) vinculado(s).'
                }
            }), 409

        advogado.ativo = False
        db.session.commit()
        return jsonify(advogado_schema.dump(advogado)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': f'Erro ao desativar advogado: {str(e)}'}}), 500


def reactivate_advogado(id):
    advogado = AdvogadoRepository.get_by_id(id, include_inactive=True)
    if not advogado:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Advogado não encontrado.'}}), 404

    if advogado.ativo:
        return jsonify({'error': {'code': 'CONFLICT', 'message': 'Advogado já está ativo.'}}), 409

    advogado = AdvogadoRepository.reactivate(advogado)
    return jsonify(advogado_schema.dump(advogado)), 200
