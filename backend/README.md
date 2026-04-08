# Backend — API Flask

API REST para o Sistema de Gestão Jurídica.

## Stack

| Item | Versão |
|------|--------|
| Python | 3.13 |
| Flask | 3.1.0 |
| SQLAlchemy | 3.1.1 |
| Marshmallow | 3.23.2 |
| Alembic | (via Flask-Migrate 4.1.0) |
| PostgreSQL | 16 |

## Dependências

Ver `requirements.txt`. Instalação:

```bash
pip install -r requirements.txt
```

## Configuração

Crie o arquivo `.env` na raiz do backend baseado no `.env.example`:

```env
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestao_juridica
SECRET_KEY=dev-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173
```

| Variável | Descrição |
|----------|-----------|
| `FLASK_APP` | Entry point da aplicação |
| `FLASK_ENV` | Ambiente (development/production) |
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `SECRET_KEY` | Chave para sessões Flask |
| `CORS_ORIGINS` | Origens permitidas para CORS |

## Execução

### Desenvolvimento (direto)

```bash
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
flask db upgrade
python run.py
```

### Docker

```bash
docker compose up -d
```

Sobe PostgreSQL + backend. Migrações são aplicadas automaticamente se configuradas no Dockerfile.

## Estrutura de Pastas

```
app/
├── __init__.py          # Factory pattern (create_app)
├── config.py            # Configurações por ambiente (python-dotenv)
├── extensions.py        # Inicialização de db e migrate
├── models/              # SQLAlchemy models
│   ├── cliente.py       # Modelo Cliente com relationship Processo
│   ├── advogado.py      # Modelo Advogado com relationship Processo
│   ├── processo.py      # Modelo Processo com relationship Devedor
│   └── devedor.py       # Modelo Devedor com FK para Processo
├── schemas/             # Marshmallow schemas (validação + serialização)
│   ├── cliente.py       # ClienteSchema, Create, Update
│   ├── advogado.py      # AdvogadoSchema, Create, Update
│   ├── processo.py      # ProcessoSchema, Create, Update
│   └── devedor.py       # DevedorSchema, Create, Update
├── repositories/        # Camada de acesso a dados
│   ├── cliente_repo.py  # CRUD + busca + paginação
│   ├── advogado_repo.py
│   ├── processo_repo.py
│   └── devedor_repo.py
├── services/            # Regras de negócio
│   ├── cliente_service.py   # Controllers Flask
│   ├── advogado_service.py
│   ├── processo_service.py
│   └── devedor_service.py
├── controllers/         # Flask Blueprints (rotas)
│   ├── cliente_bp.py
│   ├── advogado_bp.py
│   ├── processo_bp.py
│   └── devedor_bp.py
├── middleware/
│   └── error_handler.py     # Tratamento global de erros
└── utils/
    └── sanitizers.py        # Sanitização de CPF/CNPJ/OAB/telefone
```

## Padrão de Requisições

Cada módulo segue o fluxo:

```
Controller (Blueprint) → Service → Repository → Model
                                ↓
                         Schema Marshmallow (validação)
```

### Controller (`*_bp.py`)

Registra rotas Flask e delega ao service:

```python
advogado_bp.add_url_rule('/advogados', 'get_advogados', advogado_service.get_advogados, methods=['GET'])
```

### Service (`*_service.py`)

- Recebe request JSON
- Valida com Marshmallow schema
- Verifica regras de negócio (duplicatas, FK, vínculos)
- Chama repository
- Retorna JSON com status HTTP apropriado

### Repository (`*_repo.py`)

- Operações CRUD no banco via SQLAlchemy
- Busca com ILIKE
- Paginação (`paginate`)
- Ordenação dinâmica

### Schema (`schemas/*.py`)

- `*Schema`: schema base com todos os campos (dump_only para id, timestamps, ativo)
- `*CreateSchema`: exclui campos gerados automaticamente
- `*UpdateSchema`: torna campos obrigatórios opcionais para atualização parcial
- `@pre_load`: sanitização de dados (remove pontuação de CPF/CNPJ, etc.)
- `@validates`: validações customizadas (formato CPF, OAB, etc.)

## Migrações

```bash
# Gerar migração automática
flask db migrate -m "descrição"

# Aplicar migrações
flask db upgrade

# Reverter última migração
flask db downgrade
```

Migrations existentes em `migrations/versions/`.

## Validações Implementadas

| Regra | Módulo | Implementação |
|-------|--------|---------------|
| CPF válido (módulo 11) | Cliente, Advogado, Devedor | `utils/sanitizers.py` + Marshmallow |
| CNPJ válido (módulo 11) | Cliente, Devedor | `utils/sanitizers.py` + Marshmallow |
| OAB válida (UF + números) | Advogado | Regex em `sanitize_oab()` |
| CPF/CNPJ único | Cliente, Advogado, Devedor | Unique constraint DB + query prévia |
| Número de processo único | Processo | Unique constraint DB |
| Cliente existe ao criar processo | Processo | FK validation no service |
| Advogado existe ao criar processo | Processo | FK validation no service |
| Valor da dívida > 0 | Devedor | `validate.Range(min=0.01)` |
| Data da dívida não futura | Devedor | Comparação no service |
| Não desativar com vínculos | Cliente, Processo, Devedor | Query de FK ativos antes de deactivate |

## Status HTTP

| Código | Uso |
|--------|-----|
| 200 | GET, PUT, DELETE com sucesso |
| 201 | POST com sucesso |
| 400 | Dados inválidos (validation error) |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicata, vínculo ativo) |
| 500 | Erro interno do servidor |

## Health Check

```
GET /api/v1/health
```

Retorna `{"status": "ok"}` com status 200.
