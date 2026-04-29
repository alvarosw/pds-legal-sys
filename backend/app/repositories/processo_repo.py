from app.extensions import db
from app.models.processo import Processo


class ProcessoRepository:
    @staticmethod
    def get_all(page=1, per_page=20, search=None, sort='numero_processo', order='asc', include_inactive=False):
        query = Processo.query
        if not include_inactive:
            query = query.filter_by(ativo=True)

        if search:
            search_filter = (
                Processo.numero_processo.ilike(f'%{search}%') |
                Processo.tipo.ilike(f'%{search}%') |
                Processo.vara_comarca.ilike(f'%{search}%') |
                Processo.status.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)

        if sort and hasattr(Processo, sort):
            col = getattr(Processo, sort)
            if order == 'desc':
                col = col.desc()
            query = query.order_by(col)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination

    @staticmethod
    def get_by_id(id, include_inactive=False):
        query = Processo.query.filter_by(id=id)
        if not include_inactive:
            query = query.filter_by(ativo=True)
        return query.first()

    @staticmethod
    def get_by_numero(numero, include_inactive=False):
        query = Processo.query.filter_by(numero_processo=numero)
        if not include_inactive:
            query = query.filter_by(ativo=True)
        return query.first()

    @staticmethod
    def create(data):
        processo = Processo(**data)
        db.session.add(processo)
        db.session.commit()
        return processo

    @staticmethod
    def update(processo, data):
        for key, value in data.items():
            if hasattr(processo, key):
                setattr(processo, key, value)
        db.session.commit()
        return processo

    @staticmethod
    def deactivate(processo):
        processo.ativo = False
        db.session.commit()
        return processo

    @staticmethod
    def reactivate(processo):
        processo.ativo = True
        db.session.commit()
        return processo
