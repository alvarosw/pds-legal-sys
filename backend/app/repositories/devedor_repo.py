from app.extensions import db
from app.models.devedor import Devedor


class DevedorRepository:
    @staticmethod
    def get_all(page=1, per_page=20, search=None, sort='nome_razao_social', order='asc', include_inactive=False):
        query = Devedor.query
        if not include_inactive:
            query = query.filter_by(ativo=True)

        if search:
            search_filter = (
                Devedor.nome_razao_social.ilike(f'%{search}%') |
                Devedor.cpf_cnpj.ilike(f'%{search}%') |
                Devedor.contato.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)

        if sort and hasattr(Devedor, sort):
            col = getattr(Devedor, sort)
            if order == 'desc':
                col = col.desc()
            query = query.order_by(col)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination

    @staticmethod
    def get_by_id(id, include_inactive=False):
        query = Devedor.query.filter_by(id=id)
        if not include_inactive:
            query = query.filter_by(ativo=True)
        return query.first()

    @staticmethod
    def get_by_cpf_cnpj(cpf_cnpj, include_inactive=False):
        query = Devedor.query.filter_by(cpf_cnpj=cpf_cnpj)
        if not include_inactive:
            query = query.filter_by(ativo=True)
        return query.first()

    @staticmethod
    def create(data):
        devedor = Devedor(**data)
        db.session.add(devedor)
        db.session.commit()
        return devedor

    @staticmethod
    def update(devedor, data):
        for key, value in data.items():
            if hasattr(devedor, key):
                setattr(devedor, key, value)
        db.session.commit()
        return devedor

    @staticmethod
    def deactivate(devedor):
        devedor.ativo = False
        db.session.commit()
        return devedor

    @staticmethod
    def reactivate(devedor):
        devedor.ativo = True
        db.session.commit()
        return devedor
