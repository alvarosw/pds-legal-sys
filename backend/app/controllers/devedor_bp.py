from flask import Blueprint
from app.services import devedor_service

devedor_bp = Blueprint('devedores', __name__)

devedor_bp.add_url_rule('/devedores', 'get_devedores', devedor_service.get_devedores, methods=['GET'])
devedor_bp.add_url_rule('/devedores/<id>', 'get_devedor', devedor_service.get_devedor, methods=['GET'])
devedor_bp.add_url_rule('/devedores', 'create_devedor', devedor_service.create_devedor, methods=['POST'])
devedor_bp.add_url_rule('/devedores/<id>', 'update_devedor', devedor_service.update_devedor, methods=['PUT'])
devedor_bp.add_url_rule('/devedores/<id>', 'deactivate_devedor', devedor_service.deactivate_devedor, methods=['DELETE'])
