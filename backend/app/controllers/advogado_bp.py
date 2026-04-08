from flask import Blueprint
from app.services import advogado_service

advogado_bp = Blueprint('advogados', __name__)

advogado_bp.add_url_rule('/advogados', 'get_advogados', advogado_service.get_advogados, methods=['GET'])
advogado_bp.add_url_rule('/advogados/<id>', 'get_advogado', advogado_service.get_advogado, methods=['GET'])
advogado_bp.add_url_rule('/advogados', 'create_advogado', advogado_service.create_advogado, methods=['POST'])
advogado_bp.add_url_rule('/advogados/<id>', 'update_advogado', advogado_service.update_advogado, methods=['PUT'])
advogado_bp.add_url_rule('/advogados/<id>', 'deactivate_advogado', advogado_service.deactivate_advogado, methods=['DELETE'])
