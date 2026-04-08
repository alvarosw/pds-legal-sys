# Padrões de Desenvolvimento

Padrões e convenções adotados no projeto Sistema de Gestão Jurídica.

---

## 1. Estrutura do Projeto

```
pds/
├── backend/          # API Flask (Python 3.13)
├── frontend/         # SPA React (TypeScript)
└── docs/             # Documentação técnica
```

Frontend e backend são projetos independentes com repositórios de dependências separados.

---

## 2. Backend — Padrões

### 2.1 Arquitetura em Camadas

Cada módulo segue a cadeia:

```
Controller → Service → Repository → Model
                   ↓
            Marshmallow Schema
```

| Camada | Responsabilidade |
|--------|-----------------|
| **Controller** (`controllers/*_bp.py`) | Registrar rotas Flask (Blueprints). Não contém lógica de negócio. |
| **Service** (`services/*_service.py`) | Recebe request JSON, valida com Marshmallow, verifica regras de negócio, chama repository, retorna JSON + status HTTP. |
| **Repository** (`repositories/*_repo.py`) | Operações CRUD no banco via SQLAlchemy. Busca com ILIKE, paginação, ordenação. |
| **Model** (`models/*.py`) | Definição de tabelas SQLAlchemy com relacionamentos. |
| **Schema** (`schemas/*.py`) | Validação de payload e serialização com Marshmallow. |

### 2.2 Naming Conventions

| Artefato | Convenção | Exemplo |
|----------|-----------|---------|
| Model | PascalCase, singular | `Cliente`, `Advogado` |
| Tabela | plural | `clientes`, `advogados` |
| Coluna | snake_case | `nome_completo`, `cpf_cnpj` |
| Schema | PascalCase + sufixo | `ClienteSchema`, `ClienteCreateSchema` |
| Repository | PascalCase + `_Repository` | `ClienteRepository` |
| Service functions | snake_case | `get_clientes`, `create_cliente` |
| Blueprint | snake_case + `_bp` | `cliente_bp` |

### 2.3 Model SQLAlchemy

- PK: `db.String(36)` com `default=lambda: str(uuid.uuid4())`
- Timestamps: `criado_em` (auto now), `atualizado_em` (auto onupdate)
- Soft delete: campo `ativo = db.Column(db.Boolean, default=True)`
- `to_dict()`: método em todo model para serialização
- Relationships: `db.relationship('Model', backref='nome', lazy=True)`

### 2.4 Marshmallow Schema

- Schema base com todos os campos
- `dump_only=True` para: `id`, `ativo`, `criado_em`, `atualizado_em`
- `CreateSchema`: exclui campos gerados automaticamente (`exclude`)
- `UpdateSchema`: torna obrigatórios opcionais para PATCH parcial
- `@pre_load`: sanitização (remover pontuação de CPF/CNPJ/telefone)
- `@validates`: validações customizadas (formato CPF, CNPJ, OAB)

### 2.5 Service — Padrão de Resposta

```python
def get_items():
    return jsonify(data), 200

def get_item(id):
    if not item:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': '...'}}), 404
    return jsonify(item), 200

def create_item():
    errors = schema.validate(data)
    if errors:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', ...}}), 400
    return jsonify(item), 201

def deactivate_item(id):
    item = Repository.get_by_id(id)
    if not item:
        return jsonify({'error': {...}}), 404
    # Verificar vínculos ativos
    if has_active_links(item):
        return jsonify({'error': {'code': 'CONFLICT', ...}}), 409
    return jsonify(Repository.deactivate(item)), 200
```

### 2.6 Controller (Blueprint)

```python
from flask import Blueprint
from app.services import item_service

item_bp = Blueprint('items', __name__)

item_bp.add_url_rule('/items', 'get_items', item_service.get_items, methods=['GET'])
item_bp.add_url_rule('/items/<id>', 'get_item', item_service.get_item, methods=['GET'])
item_bp.add_url_rule('/items', 'create_item', item_service.create_item, methods=['POST'])
item_bp.add_url_rule('/items/<id>', 'update_item', item_service.update_item, methods=['PUT'])
item_bp.add_url_rule('/items/<id>', 'deactivate_item', item_service.deactivate_item, methods=['DELETE'])
```

Registrar em `app/__init__.py`:

```python
from .controllers.item_bp import item_bp
app.register_blueprint(item_bp, url_prefix='/api/v1')
```

### 2.7 Validações de Negócio

| Regra | Onde | Como |
|-------|------|------|
| CPF válido | Backend | Algoritmo módulo 11 em `utils/sanitizers.py` |
| CNPJ válido | Backend | Algoritmo módulo 11 em `utils/sanitizers.py` |
| OAB válida | Backend | Regex `^[A-Z]{2}\d+$` |
| Duplicidade | Backend | Query prévia + unique constraint DB |
| FK existe | Backend | Query no service antes de criar |
| Vínculos ativos | Backend | Query de FK ativos antes de deactivate |

### 2.8 Migrações

```bash
flask db migrate -m "descrição"
flask db upgrade
```

Arquivos em `migrations/versions/`. Nome descritivo na função `upgrade()`.

---

## 3. Frontend — Padrões

### 3.1 Estrutura por Módulo

Cada módulo (clientes, advogados, processos, devedores) tem 3 páginas:

| Arquivo | Função |
|---------|--------|
| `*Page.tsx` | Listagem com DataTable, busca com debounce |
| `*CriacaoPage.tsx` | Formulário de criação com validação |
| `*EdicaoPage.tsx` | Formulário de edição + botão desativar |

### 3.2 Naming Conventions

| Artefato | Convenção | Exemplo |
|----------|-----------|---------|
| Componente | PascalCase | `ClientesPage`, `MaskedInput` |
| Arquivo | kebab-case ou PascalCase | `clientes/ClientesPage.tsx` |
| Service function | camelCase | `getClientes`, `createCliente` |
| Type/Interface | PascalCase | `Cliente`, `PaginatedResponse` |
| Schema Zod | camelCase + `Schema` | `clienteSchema` |
| Type FormData | PascalCase + `FormData` | `ClienteFormData` |

### 3.3 Validação de Formulários

```typescript
// schemas/index.ts
export const clienteSchema = z.object({
  nome_completo: z.string().min(3, 'Mensagem de erro'),
  cpf_cnpj: z.string().refine(...),
  // ...
})

export type ClienteFormData = z.infer<typeof clienteSchema>
```

No componente:

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<ClienteFormData>({
  resolver: zodResolver(clienteSchema),
})
```

### 3.4 Services HTTP

```typescript
// services/cliente.service.ts
import { api } from './api'
import type { Cliente, PaginatedResponse } from '@/types'

export async function getClientes(params?: { page?: number; q?: string }) {
  const { data } = await api.get<PaginatedResponse<Cliente>>('/clientes', { params })
  return data
}

export function getErrorMessage(error: unknown): string {
  // Extrai mensagem de error.response.data.error.message
}
```

### 3.5 Componentes UI

- Componentes genéricos em `components/ui/` (shadcn/ui)
- Componentes de layout em `components/layout/`
- Usar `cn()` para merge de classNames (tailwind-merge)
- Variantes com `class-variance-authority` (CVA)

### 3.6 Roteamento

```typescript
<Route path="/clientes" element={<ClientesPage />} />
<Route path="/clientes/novo" element={<ClienteCriacaoPage />} />
<Route path="/clientes/:id" element={<ClienteEdicaoPage />} />
```

Navegação programática: `const navigate = useNavigate()` → `navigate('/clientes')`.

### 3.7 Formatters

Funções puras em `src/lib/formatters.ts`. Recebem string crua (sem pontuação) e retornam formatado.

```typescript
formatCPF('12345678900')     // "123.456.789-00"
formatCurrency(1500.50)      // "R$ 1.500,50"
formatDate('2026-04-08')     // "08/04/2026"
```

### 3.8 Path Alias

`@` resolve para `src/`. Sempre usar em imports:

```typescript
import { Button } from '@/components/ui/button'
import type { Cliente } from '@/types'
```

---

## 4. Git — Convenções

### 4.1 Mensagens de Commit

Formato: `tipo: descrição`

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Documentação |
| `chore` | Configuração, dependências, ferramentas |

Exemplos:
```
feat: adicionar módulo de devedores
fix: validar CPF/CNPJ duplicado no backend
docs: atualizar README com instruções de execução
```

### 4.2 Branches

| Branch | Uso |
|--------|-----|
| `main` | Código estável, pronto para entrega |
| `feat/*` | Funcionalidades |
| `fix/*` | Correções |

---

## 5. Banco de Dados

### 5.1 Convenções de Tabela

- Nome: plural em snake_case (`clientes`, `advogados`)
- PK: `id VARCHAR(36)` (UUID v4 como string)
- Timestamps: `criado_em TIMESTAMP`, `atualizado_em TIMESTAMP`
- Soft delete: `ativo BOOLEAN DEFAULT TRUE`
- FKs: `*_id VARCHAR(36)` referenciando `tabela.id`

### 5.2 Relacionamentos

```
Cliente 1 ── N Processo
Advogado 1 ── N Processo
Processo 1 ── N Devedor
```

FKs no modelo filho. `lazy=True` nos relationships.

### 5.3 Índices

- Unique: `cpf_cnpj`, `numero_oab`, `numero_processo`
- Adicionar índice explícito para colunas de busca frequente se necessário

---

## 6. API REST

### 6.1 Padrões

| Item | Padrão |
|------|--------|
| Base URL | `/api/v1` |
| Método CREATE | POST → 201 |
| Método READ | GET → 200 |
| Método UPDATE | PUT → 200 |
| Método DELETE | DELETE → 200 (soft delete) |
| IDs | UUID v4 (string) |
| Datas | ISO 8601 (`2026-04-08`) |
| Paginação | `?page=1&per_page=20` |
| Busca | `?q=termo` |
| Ordenação | `?sort=campo&order=asc` |

### 6.2 Formato de Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | CONFLICT",
    "message": "Mensagem legível.",
    "details": [{ "field": "campo", "message": "Detalhe" }]
  }
}
```

---

## 7. Configuração de Ambiente

### Backend (.env)

```env
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=chave-secreta
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env.local — opcional)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 8. Build e Execução

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
flask db upgrade
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Dev: localhost:5173
npm run build     # Prod: dist/
```

---

## 9. Documentação

Documentos em `docs/`:

| Arquivo | Conteúdo |
|---------|----------|
| `ADR-001-decisoes-arquiteturais.md` | Decisões de stack, arquitetura, modelo de dados, API |
| `validacao-requisitos.md` | Validação requisito a requisito contra a especificação |

READMEs em cada módulo:

| Arquivo | Conteúdo |
|---------|----------|
| `README.md` (raiz) | Visão geral, pré-requisitos, como rodar, API |
| `backend/README.md` | Guia detalhado do backend |
| `frontend/README.md` | Guia detalhado do frontend |
