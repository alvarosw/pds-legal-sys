import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import jsonify, request, current_app


def generate_token(usuario_id: str, email: str, is_admin: bool) -> str:
    """Gera um token JWT para o usuário."""
    payload = {
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow(),
        'sub': usuario_id,
        'email': email,
        'is_admin': is_admin
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')


def decode_token(token: str) -> dict:
    """Decodifica e valida o token JWT."""
    try:
        payload = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expirado.')
    except jwt.InvalidTokenError:
        raise ValueError('Token inválido.')


def token_required(f):
    """Decorator para proteger rotas que exigem autenticação."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Verifica o cabeçalho Authorization
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                # Formato: "Bearer <token>"
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                else:
                    token = auth_header
            except IndexError:
                return jsonify({
                    'error': {
                        'code': 'INVALID_TOKEN',
                        'message': 'Cabeçalho de autorização inválido.'
                    }
                }), 401

        if not token:
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Token de autenticação não fornecido.'
                }
            }), 401

        try:
            payload = decode_token(token)
            # Adiciona o payload ao contexto da requisição
            request.current_user = payload
        except ValueError as e:
            return jsonify({
                'error': {
                    'code': 'INVALID_TOKEN',
                    'message': str(e)
                }
            }), 401

        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator para proteger rotas que exigem privilégios de admin."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if not request.current_user.get('is_admin'):
            return jsonify({
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Acesso restrito a administradores.'
                }
            }), 403

        return f(*args, **kwargs)

    return decorated
