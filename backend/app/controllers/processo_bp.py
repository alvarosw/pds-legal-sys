from flask import Blueprint
from app.services import processo_service

processo_bp = Blueprint('processos', __name__)

processo_bp.add_url_rule('/processos', 'get_processos', processo_service.get_processos, methods=['GET'])
processo_bp.add_url_rule('/processos/<id>', 'get_processo', processo_service.get_processo, methods=['GET'])
processo_bp.add_url_rule('/processos', 'create_processo', processo_service.create_processo, methods=['POST'])
processo_bp.add_url_rule('/processos/<id>', 'update_processo', processo_service.update_processo, methods=['PUT'])
processo_bp.add_url_rule('/processos/<id>', 'deactivate_processo', processo_service.deactivate_processo, methods=['DELETE'])
processo_bp.add_url_rule('/processos/<id>/reactivate', 'reactivate_processo', processo_service.reactivate_processo, methods=['POST'])
