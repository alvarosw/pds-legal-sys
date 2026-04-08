from app.extensions import db
from app.models.advogado import Advogado


class AdvogadoRepository:
    @staticmethod
    def get_all(page=1, per_page=20, search=None, sort='nome_completo', order='asc'):
        query = Advogado.query.filter_by(ativo=True)

        if search:
            search_filter = (
                Advogado.nome_completo.ilike(f'%{search}%') |
                Advogado.cpf.ilike(f'%{search}%') |
                Advogado.numero_oab.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)

        if sort and hasattr(Advogado, sort):
            col = getattr(Advogado, sort)
            if order == 'desc':
                col = col.desc()
            query = query.order_by(col)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination

    @staticmethod
    def get_by_id(id):
        return Advogado.query.filter_by(id=id, ativo=True).first()

    @staticmethod
    def get_by_oab(numero_oab):
        return Advogado.query.filter_by(numero_oab=numero_oab, ativo=True).first()

    @staticmethod
    def create(data):
        advogado = Advogado(**data)
        db.session.add(advogado)
        db.session.commit()
        return advogado

    @staticmethod
    def update(advogado, data):
        for key, value in data.items():
            if hasattr(advogado, key):
                setattr(advogado, key, value)
        db.session.commit()
        return advogado

    @staticmethod
    def deactivate(advogado):
        advogado.ativo = False
        db.session.commit()
        return advogado
