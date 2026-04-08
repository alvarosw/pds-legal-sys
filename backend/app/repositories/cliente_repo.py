from app.extensions import db
from app.models.cliente import Cliente


class ClienteRepository:
    @staticmethod
    def get_all(page=1, per_page=20, search=None, sort='nome_completo', order='asc'):
        query = Cliente.query.filter_by(ativo=True)

        if search:
            search_filter = (
                Cliente.nome_completo.ilike(f'%{search}%') |
                Cliente.cpf_cnpj.ilike(f'%{search}%') |
                Cliente.telefone.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)

        if sort and hasattr(Cliente, sort):
            col = getattr(Cliente, sort)
            if order == 'desc':
                col = col.desc()
            query = query.order_by(col)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination

    @staticmethod
    def get_by_id(id):
        return Cliente.query.filter_by(id=id, ativo=True).first()

    @staticmethod
    def get_by_cpf_cnpj(cpf_cnpj):
        return Cliente.query.filter_by(cpf_cnpj=cpf_cnpj, ativo=True).first()

    @staticmethod
    def create(data):
        cliente = Cliente(**data)
        db.session.add(cliente)
        db.session.commit()
        return cliente

    @staticmethod
    def update(cliente, data):
        for key, value in data.items():
            if hasattr(cliente, key):
                setattr(cliente, key, value)
        db.session.commit()
        return cliente

    @staticmethod
    def deactivate(cliente):
        cliente.ativo = False
        db.session.commit()
        return cliente
