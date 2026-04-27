# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral do Projeto

Sistema de Gestão Jurídica para o escritório "Paulo Barra E Advogados Associados". O sistema centraliza e automatiza o controle de clientes, devedores, advogados e processos jurídicos.

### Stack Tecnológica

**Backend:**
- Python 3.13
- Flask 3.1.0
- SQLAlchemy 3.1.1
- Marshmallow 3.23.2
- PostgreSQL 16
- Alembic (via Flask-Migrate 4.1.0)

**Frontend:**
- React 19.1
- TypeScript 5.8
- Vite 6.3
- React Router 7.6
- Tailwind CSS 3.4
- shadcn/ui (Radix UI primitives)
- TanStack Table 8.21
- React Hook Form 7.56
- Zod 3.25
- Zustand 5.0

## Comandos de Desenvolvimento

### Backend

```bash
cd backend

# Ativar ambiente virtual
venv\Scripts\activate   # Windows
source venv/bin/activate  # Linux/macOS

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente (criar .env baseado em .env.example)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestao_juridica
# SECRET_KEY=dev-secret-key-change-in-production
# CORS_ORIGINS=http://localhost:5173

# Aplicar migrações
flask db upgrade

# Executar servidor de desenvolvimento
python run.py
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev       # http://localhost:5173

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Docker

```bash
# Subir backend + PostgreSQL
docker compose up -d
```

## Arquitetura

### Backend - Arquitetura em Camadas

```
Controller (Blueprint) → Service → Repository → Model
                                ↓
                         Schema Marshmallow (validação)
```

**Estrutura de Pastas:**
- `app/models/` - SQLAlchemy models (cliente, advogado, processo, devedor)
- `app/schemas/` - Marshmallow schemas (validação + serialização)
- `app/repositories/` - Camada de acesso a dados (CRUD + busca + paginação)
- `app/services/` - Regras de negócio
- `app/controllers/` - Flask Blueprints (rotas)
- `app/middleware/` - Tratamento global de erros
- `app/utils/` - Sanitização de CPF/CNPJ/OAB/telefone
- `migrations/versions/` - Migrações de banco de dados

**Padrão de Requisições:**
1. Controller registra rotas Flask e delega ao service
2. Service valida com Marshmallow schema, verifica regras de negócio, chama repository
3. Repository executa operações CRUD via SQLAlchemy com busca ILIKE e paginação
4. Schema valida e serializa dados (pre_load para sanitização, validates para validações customizadas)

### Frontend - SPA React

**Estrutura de Pastas:**
- `src/components/ui/` - shadcn/ui components (badge, button, card, data-table, dialog, input, label, masked-input, select)
- `src/components/layout/` - AppLayout, Header, Sidebar
- `src/pages/` - Páginas de listagem, criação e edição (clientes, advogados, devedores, processos)
- `src/services/` - Instância Axios configurada + funções HTTP para cada entidade
- `src/schemas/` - Zod schemas para validação de formulários
- `src/types/` - TypeScript interfaces
- `src/lib/` - Formatters (CPF, CNPJ, telefone, moeda, data) e utilitários
- `src/routes/` - Definição de rotas (React Router)

**Padrão de Componentes:**
- Páginas de Listagem (`*Page.tsx`): Busca com debounce, DataTable genérica, botão "Novo", loading/empty states
- Páginas de Criação (`*CriacaoPage.tsx`): react-hook-form + zodResolver, MaskedInput para CPF/CNPJ/telefone, Select para relacionamentos
- Páginas de Edição (`*EdicaoPage.tsx`): useParams para ID, useEffect para buscar dados, reset() do hook form, botão "Desativar" com Dialog

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

## Configuração da API

Endpoint base: `http://localhost:5000/api/v1`

Para apontar para outro servidor, defina a variável de ambiente `VITE_API_URL` no frontend:

```bash
# frontend/.env.local
VITE_API_URL=http://meu-servidor:5000/api/v1
```

## Migrações

```bash
# Gerar migração automática
flask db migrate -m "descrição"

# Aplicar migrações
flask db upgrade

# Reverter última migração
flask db downgrade
```

## Gerenciamento de Tarefas

O controle de tarefas é feito via Trello no board:
- **Board:** GESTÃO JURÍDICA - EQUIPE 10 - TRABALHO PDS 2026.1
- **URL:** https://trello.com/b/rvju9VMO/gest%C3%A3o-jur%C3%ADdica-equipe-10-trabalho-pds-20261

**Listas:**
- Atividades iniciais
- Backlog
- Em progresso
- Feito

## Requisitos do Sistema

Os requisitos funcionais e não-funcionais estão documentados em `Espec de Requisitos.pdf`:

**Requisitos Funcionais (RF001-RF016):**
- RF001-RF004: CRUD Cliente (Cadastrar, Consultar, Editar, Desativar)
- RF005-RF008: CRUD Processo (Cadastrar, Consultar, Editar, Desativar)
- RF009-RF012: CRUD Devedor (Cadastrar, Consultar, Editar, Desativar)
- RF013-RF016: CRUD Advogado (Cadastrar, Consultar, Editar, Desativar)

**Requisitos Não-Funcionais (NF001-NF006):**
- NF001: Acessibilidade (WCAG 2.1)
- NF002: Ajuda e Suporte Contextual
- NF003: Portabilidade e Compatibilidade Multiplataforma
- NF004: Backup e Recuperação de Dados
- NF005: Escalabilidade
- NF006: Disponibilidade e Continuidade do Serviço

## Documentação Adicional

- `docs/ADRs-decisoes-arquiteturais.md` - Decisões arquiteturais
- `docs/padroes-de-desenvolvimento.md` - Padrões de desenvolvimento
- `docs/validacao-requisitos.md` - Validação de requisitos

## Path Alias

No frontend, `@` resolve para `src/`:

```typescript
import { Button } from '@/components/ui/button'
// Resolve para src/components/ui/button.tsx
```

Configurado em `vite.config.ts` + `tsconfig.json`.

## Health Check

```
GET /api/v1/health
```

Retorna `{"status": "ok"}` com status 200.
