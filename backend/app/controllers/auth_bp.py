from flask import Blueprint

from app.services import auth_service

auth_bp = Blueprint('auth', __name__)

# Rotas de autenticação
auth_bp.add_url_rule('/auth/login', 'login', auth_service.login, methods=['POST'])

# Rotas de usuários (protegidas - exigem auth)
auth_bp.add_url_rule('/usuarios', 'get_usuarios', auth_service.get_usuarios, methods=['GET'])
auth_bp.add_url_rule('/usuarios/<id>', 'get_usuario', auth_service.get_usuario, methods=['GET'])
auth_bp.add_url_rule('/usuarios', 'create_usuario', auth_service.create_usuario, methods=['POST'])
auth_bp.add_url_rule('/usuarios/<id>/deactivate', 'deactivate_usuario', auth_service.deactivate_usuario, methods=['DELETE'])
auth_bp.add_url_rule('/usuarios/<id>/reactivate', 'reactivate_usuario', auth_service.reactivate_usuario, methods=['POST'])
