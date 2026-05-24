from flask import jsonify, request
from app.extensions import db
from app.schemas.usuario import UsuarioSchema, UsuarioCreateSchema, LoginSchema
from app.repositories.usuario_repo import UsuarioRepository
from app.middleware.auth import generate_token

usuario_schema = UsuarioSchema()
usuario_create_schema = UsuarioCreateSchema()
login_schema = LoginSchema()


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


def get_usuarios():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q')
    sort = request.args.get('sort', 'nome')
    order = request.args.get('order', 'asc')
    include_inactive = request.args.get('include_inactive', False, type=bool)

    pagination = UsuarioRepository.get_all(
        page=page, per_page=per_page, search=q, sort=sort, order=order, include_inactive=include_inactive
    )
    return jsonify(paginate_response(usuario_schema.dump(pagination.items), pagination)), 200


def get_usuario(id):
    include_inactive = request.args.get('include_inactive', False, type=bool)
    usuario = UsuarioRepository.get_by_id(id, include_inactive=include_inactive)
    if not usuario:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Usuário não encontrado.'}}), 404
    return jsonify(usuario_schema.dump(usuario)), 200


def create_usuario():
    try:
        data = request.get_json()
        errors = usuario_create_schema.validate(data)
        if errors:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

        # Verifica se e-mail já existe
        existing = UsuarioRepository.get_by_email(data.get('email'))
        if existing:
            return jsonify({'error': {'code': 'CONFLICT', 'message': 'E-mail já cadastrado.'}}), 409

        validated = usuario_create_schema.load(data)

        # Cria o usuário e define a senha com hash
        usuario = UsuarioRepository.create(validated)
        if 'senha' in validated:
            usuario.set_senha(validated.pop('senha'))
            db.session.commit()

        return jsonify(usuario_schema.dump(usuario)), 201
    except Exception as e:
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': str(e)}}), 500


def login():
    """Realiza o login do usuário e retorna o token JWT."""
    try:
        data = request.get_json()
        errors = login_schema.validate(data)
        if errors:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Dados inválidos.', 'details': errors}}), 400

        email = data.get('email')
        senha = data.get('senha')

        # Busca usuário (inclui inativos para permitir mensagem adequada)
        usuario = UsuarioRepository.get_by_email(email, include_inactive=True)

        if not usuario:
            return jsonify({'error': {'code': 'UNAUTHORIZED', 'message': 'Credenciais inválidas.'}}), 401

        if not usuario.ativo:
            return jsonify({'error': {'code': 'ACCOUNT_DISABLED', 'message': 'Conta desativada.'}}), 403

        if not usuario.check_senha(senha):
            return jsonify({'error': {'code': 'UNAUTHORIZED', 'message': 'Credenciais inválidas.'}}), 401

        # Gera token JWT
        token = generate_token(usuario.id, usuario.email, usuario.eh_admin)

        return jsonify({
            'token': token,
            'usuario': usuario_schema.dump(usuario)
        }), 200

    except Exception as e:
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': str(e)}}), 500


def deactivate_usuario(id):
    try:
        usuario = UsuarioRepository.get_by_id(id)
        if not usuario:
            return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Usuário não encontrado.'}}), 404

        usuario.ativo = False
        db.session.commit()
        return jsonify(usuario_schema.dump(usuario)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': f'Erro ao desativar usuário: {str(e)}'}}), 500


def reactivate_usuario(id):
    usuario = UsuarioRepository.get_by_id(id, include_inactive=True)
    if not usuario:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Usuário não encontrado.'}}), 404

    if usuario.ativo:
        return jsonify({'error': {'code': 'CONFLICT', 'message': 'Usuário já está ativo.'}}), 409

    usuario = UsuarioRepository.reactivate(usuario)
    return jsonify(usuario_schema.dump(usuario)), 200
