# Sistema de Gestão Jurídica

Sistema para controle de clientes, processos, devedores e advogados do escritório Paulo Barra E Advogados Associados.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind CSS + shadcn/ui |
| Backend | Python 3.13 + Flask 3 + SQLAlchemy + Marshmallow + Alembic |
| Banco de Dados | PostgreSQL 16 |

## Pré-requisitos

| Software | Versão mínima |
|----------|--------------|
| Node.js | 20.x |
| npm | 10.x |
| Python | 3.13 |
| PostgreSQL | 16 |
| Docker (opcional) | 24.x |


## 🚀 Quickstart (Recomendado)

Execute todo o sistema (banco, backend, frontend) com um único comando usando Docker Compose na raiz do projeto:

```bash
docker compose down -v  # Remove volumes antigos (opcional)
docker compose up --build
```

Acesse:
- **Frontend:** http://localhost:80
- **API:** http://localhost:5000/api/v1

Para parar:
- `docker compose down` (mantém dados)
- `docker compose down -v` (remove dados)

O Docker Compose da raiz sobe 3 serviços em ordem:
1. **postgres** — aguarda healthcheck (`pg_isready`)
2. **backend** — espera o postgres, roda `flask db upgrade`, inicia Flask
3. **frontend** — espera o backend, serve o build estático via `serve`

---

## 👩‍💻 Desenvolvimento Local (sem Docker)

### 1. Banco de Dados

Suba um PostgreSQL localmente (fora do Docker) OU use o serviço do Docker Compose:

- **Opção A:** Use o banco do Docker Compose (recomendado)
  - Rode apenas `docker compose up postgres` na raiz
- **Opção B:** Instale PostgreSQL 16 localmente, crie um banco chamado `gestao_juridica` e configure o `.env` (veja `backend/.env.example`)

### 2. Backend

```bash
cd backend
python -m venv venv
# Ativar (Windows)
venv\Scripts\activate
# Ativar (Linux/macOS)
source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Edite DATABASE_URL se necessário
flask db upgrade
python run.py
```

Servidor disponível em http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação disponível em http://localhost:5173

> **Obs:** Se rodar frontend localmente, edite `frontend/src/services/api.ts` se precisar mudar a URL da API.

## Endpoints da API

Base URL: `http://localhost:5000/api/v1`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/clientes` | Listar clientes |
| POST | `/clientes` | Criar cliente |
| GET | `/clientes/:id` | Detalhar cliente |
| PUT | `/clientes/:id` | Atualizar cliente |
| DELETE | `/clientes/:id` | Desativar cliente |
| GET | `/advogados` | Listar advogados |
| POST | `/advogados` | Criar advogado |
| GET | `/advogados/:id` | Detalhar advogado |
| PUT | `/advogados/:id` | Atualizar advogado |
| DELETE | `/advogados/:id` | Desativar advogado |
| GET | `/processos` | Listar processos |
| POST | `/processos` | Criar processo |
| GET | `/processos/:id` | Detalhar processo |
| PUT | `/processos/:id` | Atualizar processo |
| DELETE | `/processos/:id` | Encerrar processo |
| GET | `/devedores` | Listar devedores |
| POST | `/devedores` | Criar devedor |
| GET | `/devedores/:id` | Detalhar devedor |
| PUT | `/devedores/:id` | Atualizar devedor |
| DELETE | `/devedores/:id` | Desativar devedor |

### Formato de resposta (listas)

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Formato de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos.",
    "details": [{ "field": "cpf_cnpj", "message": "CPF/CNPJ inválido." }]
  }
}
```

### Query params

| Param | Descrição | Padrão |
|-------|-----------|--------|
| `page` | Página | 1 |
| `per_page` | Itens por página | 20 |
| `q` | Termo de busca | — |
| `sort` | Campo de ordenação | Varia por módulo |
| `order` | `asc` ou `desc` | `asc` |

## Estrutura do Projeto

```
pds/
├── backend/              # API Flask
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Marshmallow schemas
│   │   ├── repositories/ # Acesso a dados
│   │   ├── services/     # Regras de negócio
│   │   └── controllers/  # Flask blueprints
│   ├── migrations/       # Alembic migrations
│   └── docker-compose.yml
├── frontend/             # SPA React
│   └── src/
│       ├── components/   # UI (shadcn/ui + layout)
│       ├── pages/        # Páginas por módulo
│       ├── services/     # HTTP clients (Axios)
│       ├── schemas/      # Zod validation
│       └── routes/       # React Router
└── docs/                 # Documentação técnica
```

## Documentação Adicional

| Documento | Descrição |
|-----------|-----------|
| [docs/padroes-de-desenvolvimento.md](docs/padroes-de-desenvolvimento.md) | Padrões e convenções de código (arquitetura, naming, git, API, DB) |
| [docs/ADR-001-decisoes-arquiteturais.md](docs/ADR-001-decisoes-arquiteturais.md) | Decisões arquiteturais do projeto |
| [docs/validacao-requisitos.md](docs/validacao-requisitos.md) | Validação completa dos requisitos funcionais |
| [backend/README.md](backend/README.md) | Guia detalhado do backend |
| [frontend/README.md](frontend/README.md) | Guia detalhado do frontend |

## Configuração de Ambiente

### Backend (.env)

```env
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestao_juridica
CORS_ORIGINS=http://localhost:5173
```

### Frontend (variáveis do Vite)

Sem configuração necessária por padrão. O frontend assume que o backend está em `http://localhost:5000/api/v1`. Para alterar, edite `frontend/src/services/api.ts`.
