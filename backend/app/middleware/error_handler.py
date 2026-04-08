from flask import jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({
            'error': {
                'code': 'HTTP_ERROR',
                'message': e.description,
            }
        }), e.code

    @app.errorhandler(404)
    def handle_404(e):
        return jsonify({
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Recurso não encontrado.',
            }
        }), 404

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Erro interno do servidor.',
            }
        }), 500
