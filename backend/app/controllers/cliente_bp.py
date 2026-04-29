from flask import Blueprint
from app.services import cliente_service

cliente_bp = Blueprint('clientes', __name__)

cliente_bp.add_url_rule('/clientes', 'get_clientes', cliente_service.get_clientes, methods=['GET'])
cliente_bp.add_url_rule('/clientes/<id>', 'get_cliente', cliente_service.get_cliente, methods=['GET'])
cliente_bp.add_url_rule('/clientes', 'create_cliente', cliente_service.create_cliente, methods=['POST'])
cliente_bp.add_url_rule('/clientes/<id>', 'update_cliente', cliente_service.update_cliente, methods=['PUT'])
cliente_bp.add_url_rule('/clientes/<id>', 'deactivate_cliente', cliente_service.deactivate_cliente, methods=['DELETE'])
cliente_bp.add_url_rule('/clientes/<id>/reactivate', 'reactivate_cliente', cliente_service.reactivate_cliente, methods=['POST'])
