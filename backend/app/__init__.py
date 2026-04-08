from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate
from .middleware.error_handler import register_error_handlers


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    # Error handlers
    register_error_handlers(app)

    # Blueprints
    from .controllers.health_bp import health_bp
    from .controllers.cliente_bp import cliente_bp
    from .controllers.advogado_bp import advogado_bp
    from .controllers.devedor_bp import devedor_bp
    from .controllers.processo_bp import processo_bp

    app.register_blueprint(health_bp, url_prefix='/api/v1')
    app.register_blueprint(cliente_bp, url_prefix='/api/v1')
    app.register_blueprint(advogado_bp, url_prefix='/api/v1')
    app.register_blueprint(devedor_bp, url_prefix='/api/v1')
    app.register_blueprint(processo_bp, url_prefix='/api/v1')

    return app
