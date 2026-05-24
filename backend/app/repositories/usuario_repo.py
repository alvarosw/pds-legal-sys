from app.extensions import db
from app.models.usuario import Usuario


class UsuarioRepository:
    @staticmethod
    def get_all(page=1, per_page=20, search=None, sort='nome', order='asc', include_inactive=False):
        query = Usuario.query
        if not include_inactive:
            query = query.filter_by(ativo=True)

        if search:
            search_filter = (
                Usuario.nome.ilike(f'%{search}%') |
                Usuario.email.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)

        if sort and hasattr(Usuario, sort):
            col = getattr(Usuario, sort)
            if order == 'desc':
                col = col.desc()
            query = query.order_by(col)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination

    @staticmethod
    def get_by_id(id, include_inactive=False):
        query = Usuario.query.filter_by(id=id)
        if not include_inactive:
            query = query.filter_by(ativo=True)
        return query.first()

    @staticmethod
    def get_by_email(email, include_inactive=False):
        query = Usuario.query.filter_by(email=email)
        if not include_inactive:
            query = query.filter_by(ativo=True)
        return query.first()

    @staticmethod
    def create(data):
        usuario = Usuario(**data)
        db.session.add(usuario)
        db.session.commit()
        return usuario

    @staticmethod
    def update(usuario, data):
        for key, value in data.items():
            if hasattr(usuario, key):
                setattr(usuario, key, value)
        db.session.commit()
        return usuario

    @staticmethod
    def deactivate(usuario):
        usuario.ativo = False
        db.session.commit()
        return usuario

    @staticmethod
    def reactivate(usuario):
        usuario.ativo = True
        db.session.commit()
        return usuario
