# ADR-001: Decisões Arquiteturais — Sistema de Gestão Jurídica

| Campo         | Valor                                                        |
|---------------|--------------------------------------------------------------|
| **Status**    | Concluído (Sprint 2)                                         |
| **Data**      | 08/04/2026                                                   |
| **Autores**   | Equipe 10 — PDS 2026.1                                       |
| **Contexto**  | Especificação de Requisitos v4.1                             |

---

## 1. Contexto

O **Sistema de Gestão Jurídica** tem como objetivo centralizar e automatizar o controle de **clientes**, **devedores** e **processos jurídicos** do escritório **Paulo Barra E Advogados Associados**, oferecendo interface moderna e responsiva.

O sistema será utilizado localmente, sem autenticação, pelos membros da equipe do escritório.

Este documento registra todas as decisões arquiteturais necessárias para guiar o desenvolvimento do sistema.

---

## 2. Stack Tecnológico

### 2.1 Frontend

| Decisão                 | Tecnologia                                              | Justificativa                                                                 |
|-------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------|
| Linguagem               | **TypeScript**                                          | Tipagem estática, melhor DX, prevenção de bugs em tempo de compilação         |
| Framework UI            | **React 19**                                            | Ecossistema maduro, comunidade ativa, componentização reutilizável            |
| Build Tool              | **Vite 6**                                              | Build rápido, HMR instantâneo, configuração mínima                            |
| Roteamento              | **React Router v7**                                     | Padrão da indústria para SPA, suporte a lazy loading e rotas protegidas       |
| Gerenciamento de Estado | **Zustand**                                             | Leve, simples, sem boilerplate excessivo (comparado a Redux)                  |
| HTTP Client             | **Axios**                                               | Interceptors, cancelamento de requests, tipagem com TypeScript                |
| Validação de Formulários| **React Hook Form + Zod**                               | Validação type-safe, performance otimizada, integração direta com inputs      |
| UI Component Library    | **shadcn/ui + Tailwind CSS**                            | Componentes acessíveis (WCAG 2.1), customizáveis, sem lock-in de framework    |
| Tabela/Data Grid        | **TanStack Table v8**                                   | Ordenação, filtros, paginação, acessível                                      |
| Ícones                  | **Lucide React**                                        | Biblioteca leve e consistente                                                 |

### 2.2 Backend

| Decisão                | Tecnologia                                              | Justificativa                                                                 |
|------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------|
| Linguagem              | **Python 3.13**                                         | Produtividade, legibilidade, ampla adoção em APIs                             |
| Framework Web          | **Flask 3.x**                                           | Leve, flexível, ideal para APIs REST, fácil curva de aprendizado              |
| ORM                    | **SQLAlchemy 2.x**                                      | ORM maduro, suporte a migrations, query builder poderoso                      |
| Migrations             | **Alembic**                                             | Integração nativa com SQLAlchemy, versionamento de schema                     |
| Validação/Serialização | **Marshmallow**                                         | Validação de payload, serialização, integração com SQLAlchemy                 |
| Banco de Dados         | **PostgreSQL 16**                                       | Robustez, ACID, JSONB, full-text search, ampla adoção enterprise              |
| CORS                   | **Flask-CORS**                                          | Controle de origens permitidas para comunicação frontend/backend              |
| Testing                | **pytest + pytest-flask**                               | Framework de testes maduro, fixtures, cobertura                               |

### 2.3 Infraestrutura

| Decisão                | Tecnologia                                              | Justificativa                                                                 |
|------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------|
| Containerização        | **Docker + Docker Compose**                             | Reprodutibilidade de ambiente, facilita desenvolvimento local                 |
| Variáveis de Ambiente  | **python-dotenv**                                       | Gerenciamento simples de configurações por ambiente                           |

---

## 3. Arquitetura do Sistema

### 3.1 Estilo Arquitetural

**Arquitetura Cliente-Servidor com API REST** — separação clara entre frontend (SPA React) e backend (API Flask), comunicando-se via HTTP/JSON.

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│         Frontend (React)        │       │         Backend (Flask)         │
│                                 │       │                                 │
│  ┌─────────────────────────┐    │  HTTP │  ┌─────────────────────────┐    │
│  │    Componentes UI       │    │◄─────►│  │      Controllers        │    │
│  │    (shadcn/ui)          │    │ /JSON │  │      (Views Flask)      │    │
│  └─────────────────────────┘    │       │  └───────────┬─────────────┘    │
│                                 │       │              │                  │
│  ┌─────────────────────────┐    │       │  ┌───────────▼─────────────┐    │
│  │    Services (Axios)     │    │       │  │      Services           │    │
│  │    State (Zustand)      │    │       │  │    (Regras de Negócio)  │    │
│  └─────────────────────────┘    │       │  └───────────┬─────────────┘    │
│                                 │       │              │                  │
│  ┌─────────────────────────┐    │       │  ┌───────────▼─────────────┐    │
│  │    React Router v7      │    │       │  │      Repository         │    │
│  │    (Rotas)              │    │       │  │    (SQLAlchemy ORM)     │    │
│  └─────────────────────────┘    │       │  └───────────┬─────────────┘    │
│                                 │       │              │                  │
└─────────────────────────────────┘       │  ┌───────────▼─────────────┐    │
                                          │  │     PostgreSQL 16       │    │
                                          │  └─────────────────────────┘    │
                                          └─────────────────────────────────┘
```

### 3.2 Estrutura de Pastas

#### Frontend

```
frontend/
├── public/
├── src/
│   ├── assets/              # Imagens, ícones, fontes
│   ├── components/          # Componentes reutilizáveis UI
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Header, Sidebar, Footer
│   │   └── common/          # Modal, Toast, Pagination
│   ├── pages/               # Páginas da aplicação
│   │   ├── clientes/
│   │   ├── advogados/
│   │   ├── processos/
│   │   └── devedores/
│   ├── services/            # Chamadas HTTP (Axios)
│   │   ├── cliente.service.ts
│   │   ├── advogado.service.ts
│   │   ├── processo.service.ts
│   │   └── devedor.service.ts
│   ├── hooks/               # Custom hooks
│   ├── store/               # Zustand stores
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript interfaces/types
│   ├── utils/               # Funções utilitárias
│   ├── routes/              # Definição de rotas
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

#### Backend

```
backend/
├── app/
│   ├── __init__.py          # Factory pattern (create_app)
│   ├── config.py            # Configurações por ambiente
│   ├── extensions.py        # db, migrate
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── cliente.py
│   │   ├── advogado.py
│   │   ├── processo.py
│   │   └── devedor.py
│   ├── schemas/             # Marshmallow schemas
│   │   ├── __init__.py
│   │   ├── cliente.py
│   │   ├── advogado.py
│   │   ├── processo.py
│   │   └── devedor.py
│   ├── services/            # Regras de negócio
│   │   ├── __init__.py
│   │   ├── cliente_service.py
│   │   ├── advogado_service.py
│   │   ├── processo_service.py
│   │   └── devedor_service.py
│   ├── controllers/         # Flask blueprints/views
│   │   ├── __init__.py
│   │   ├── cliente_bp.py
│   │   ├── advogado_bp.py
│   │   ├── processo_bp.py
│   │   └── devedor_bp.py
│   ├── repositories/        # Acesso a dados
│   │   ├── __init__.py
│   │   ├── cliente_repo.py
│   │   ├── advogado_repo.py
│   │   ├── processo_repo.py
│   │   └── devedor_repo.py
│   ├── middleware/           # Middleware customizado
│   │   └── error_handler.py
│   └── utils/               # Utilitários
│       └── validators.py     # Validação CPF/CNPJ/OAB
├── migrations/              # Alembic migrations
├── tests/                   # pytest
│   ├── test_models/
│   ├── test_services/
│   ├── test_controllers/
│   └── conftest.py
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── run.py
```

---

## 4. Modelo de Dados

### 4.1 Entidades e Atributos

#### Cliente

| Campo          | Tipo          | Obrigatório | Restrições                           |
|----------------|---------------|-------------|--------------------------------------|
| id             | UUID          | Sim         | PK, auto-gerado                      |
| nome_completo  | VARCHAR(200)  | Sim         |                                      |
| cpf_cnpj       | VARCHAR(18)   | Sim         | Único, validado                      |
| telefone       | VARCHAR(20)   | Sim         |                                      |
| email          | VARCHAR(150)  | Não         | Formato email válido                 |
| endereco       | TEXT          | Sim         |                                      |
| observacoes    | TEXT          | Não         |                                      |
| ativo          | BOOLEAN       | Sim         | Default: True                        |
| criado_em      | TIMESTAMP     | Sim         | Auto (now)                           |
| atualizado_em  | TIMESTAMP     | Sim         | Auto (onupdate)                      |

#### Advogado

| Campo          | Tipo          | Obrigatório | Restrições                           |
|----------------|---------------|-------------|--------------------------------------|
| id             | UUID          | Sim         | PK, auto-gerado                      |
| nome_completo  | VARCHAR(200)  | Sim         |                                      |
| numero_oab     | VARCHAR(20)   | Sim         | Único, validado                      |
| cpf            | VARCHAR(14)   | Sim         | Único, validado                      |
| email          | VARCHAR(150)  | Sim         | Formato email válido                 |
| telefone       | VARCHAR(20)   | Não         |                                      |
| especialidade  | VARCHAR(100)  | Não         |                                      |
| ativo          | BOOLEAN       | Sim         | Default: True                        |
| criado_em      | TIMESTAMP     | Sim         | Auto (now)                           |
| atualizado_em  | TIMESTAMP     | Sim         | Auto (onupdate)                      |

#### Processo

| Campo              | Tipo          | Obrigatório | Restrições                                                 |
|--------------------|---------------|-------------|------------------------------------------------------------|
| id                 | UUID          | Sim         | PK, auto-gerado                                            |
| numero_processo    | VARCHAR(50)   | Sim         | Único, validado                                            |
| tipo               | VARCHAR(100)  | Sim         |                                                            |
| cliente_id         | UUID          | Sim         | FK → Cliente.id                                            |
| data_abertura      | DATE          | Sim         |                                                            |
| vara_comarca       | VARCHAR(150)  | Sim         |                                                            |
| status             | VARCHAR(50)   | Sim         | Enum: Aberto, Em Andamento, Suspenso, Encerrado, Arquivado |
| advogado_resp_id   | UUID          | Não         | FK → Advogado.id                                           |
| valor_causa        | DECIMAL(12,2) | Não         | >= 0                                                       |
| observacoes        | TEXT          | Não         |                                                            |
| ativo              | BOOLEAN       | Sim         | Default: True                                              |
| criado_em          | TIMESTAMP     | Sim         | Auto (now)                                                 |
| atualizado_em      | TIMESTAMP     | Sim         | Auto (onupdate)                                            |

#### Devedor

| Campo              | Tipo          | Obrigatório | Restrições                           |
|--------------------|---------------|-------------|--------------------------------------|
| id                 | UUID          | Sim         | PK, auto-gerado                      |
| nome_razao_social  | VARCHAR(200)  | Sim         |                                      |
| cpf_cnpj           | VARCHAR(18)   | Sim         | Único, validado                      |
| valor_divida       | DECIMAL(12,2) | Sim         | > 0                                  |
| data_divida        | DATE          | Sim         |                                      |
| origem_descricao   | TEXT          | Sim         |                                      |
| contato            | VARCHAR(150)  | Não         |                                      |
| processo_id        | UUID          | Não         | FK → Processo.id                     |
| observacoes        | TEXT          | Não         |                                      |
| ativo              | BOOLEAN       | Sim         | Default: True                        |
| criado_em          | TIMESTAMP     | Sim         | Auto (now)                           |
| atualizado_em      | TIMESTAMP     | Sim         | Auto (onupdate)                      |

### 4.2 Relacionamentos

```
Cliente 1 ──── N Processo
Advogado 1 ──── N Processo
Processo 1 ──── N Devedor
```

### 4.3 Diagrama ER Simplificado

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│  Cliente    │       │    Processo      │       │  Advogado    │
├─────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)     │◄──┐   │ id (PK)          │   ┌──►│ id (PK)      │
│ nome        │   │   │ numero_processo  │   │   │ nome         │
│ cpf_cnpj    │   └───│ cliente_id (FK)  │   │   │ numero_oab   │
│ telefone    │       │ tipo             │   │   │ cpf          │
│ email       │       │ data_abertura    │   │   │ email        │
│ endereco    │       │ vara_comarca     │   │   │ telefone     │
│ observacoes │       │ status           │   │   │ especialidade│
│ ativo       │       │ advogado_id (FK) │───┘   │ ativo        │
│ criado_em   │       │ valor_causa      │       │ criado_em    │
│ atualizado  │       │ observacoes      │       │ atualizado   │
└─────────────┘       │ ativo            │       └──────────────┘
                      │ criado_em        │
                      │ atualizado       │
                      └────────┬─────────┘
                               │
                               │ 1:N
                               ▼
                      ┌──────────────────┐
                      │    Devedor       │
                      ├──────────────────┤
                      │ id (PK)          │
                      │ nome_razao_social│
                      │ cpf_cnpj         │
                      │ valor_divida     │
                      │ data_divida      │
                      │ origem_descricao │
                      │ contato          │
                      │ processo_id (FK) │
                      │ observacoes      │
                      │ ativo            │
                      │ criado_em        │
                      │ atualizado       │
                      └──────────────────┘
```

---

## 5. API REST — Endpoints

### 5.1 Padrões da API

| Item                  | Padrão                                                                                            |
|-----------------------|---------------------------------------------------------------------------------------------------|
| Base URL              | `/api/v1`                                                                                         |
| Formato de resposta   | JSON                                                                                              |
| Paginação             | Query params: `?page=1&per_page=20`                                                               |
| Ordenação             | Query params: `?sort=nome&order=asc`                                                              |
| Busca/Filtros         | Query params: `?q=termo&status=aberto`                                                            |
| Data/Hora             | ISO 8601 (`2026-04-07T10:30:00Z`)                                                                 |
| IDs                   | UUID v4                                                                                           |
| Status HTTP           | 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 409 (Conflict), 500 (Internal Error) |

### 5.2 Endpoints

#### Clientes

| Método | Endpoint               | Descrição                | Corpo (POST/PUT)                                                         |
|--------|------------------------|--------------------------|--------------------------------------------------------------------------|
| GET    | `/clientes`            | Listar clientes          | —                                                                        |
| GET    | `/clientes/:id`        | Detalhar cliente         | —                                                                        |
| POST   | `/clientes`            | Criar cliente            | `{ nome_completo*, cpf_cnpj*, telefone*, endereco, email, observacoes }` |
| PUT    | `/clientes/:id`        | Atualizar cliente        | Campos parciais                                                          |
| DELETE | `/clientes/:id`        | Desativar cliente        | —                                                                        |

#### Advogados

| Método | Endpoint               | Descrição                | Corpo (POST/PUT)                                                         |
|--------|------------------------|--------------------------|--------------------------------------------------------------------------|
| GET    | `/advogados`           | Listar advogados         | —                                                                        |
| GET    | `/advogados/:id`       | Detalhar advogado        | —                                                                        |
| POST   | `/advogados`           | Criar advogado           | `{ nome_completo*, numero_oab*, cpf*, email*, telefone, especialidade }` |
| PUT    | `/advogados/:id`       | Atualizar advogado       | Campos parciais                                                          |
| DELETE | `/advogados/:id`       | Desativar advogado       | —                                                                        |

#### Processos

| Método | Endpoint               | Descrição                | Corpo (POST/PUT)                                                                                                          |
|--------|------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------|
| GET    | `/processos`           | Listar processos         | —                                                                                                                         |
| GET    | `/processos/:id`       | Detalhar processo        | —                                                                                                                         |
| POST   | `/processos`           | Criar processo           | `{ numero_processo*, tipo*, cliente_id*, data_abertura*, vara_comarca*, status*, advogado_id, valor_causa, observacoes }` |
| PUT    | `/processos/:id`       | Atualizar processo       | Campos parciais                                                                                                           |
| DELETE | `/processos/:id`       | Encerrar/Arquivar processo| —                                                                                                                        |

#### Devedores

| Método | Endpoint               | Descrição                | Corpo (POST/PUT)                                                                                                       |
|--------|------------------------|--------------------------|------------------------------------------------------------------------------------------------------------------------|
| GET    | `/devedores`           | Listar devedores         | —                                                                                                                      |
| GET    | `/devedores/:id`       | Detalhar devedor         | —                                                                                                                      |
| POST   | `/devedores`           | Criar devedor            | `{ nome_razao_social*, cpf_cnpj*, valor_divida*, data_divida*, origem_descricao*, contato, processo_id, observacoes }` |
| PUT    | `/devedores/:id`       | Atualizar devedor        | Campos parciais                                                                                                        |
| DELETE | `/devedores/:id`       | Desativar devedor        | —                                                                                                                      |

### 5.3 Formato de Resposta

#### Lista paginada

```json
{
  "data": [
    { "id": "...", "nome_completo": "...", "cpf_cnpj": "..." }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Preencha todos os campos obrigatórios.",
    "details": [
      { "field": "cpf_cnpj", "message": "CPF/CNPJ inválido, verifique e tente novamente." }
    ]
  }
}
```

---

## 6. Requisitos Não-Funcionais — Implementação

| Req   | Requisito                           | Como será atendido                                                                     |
|-------|-------------------------------------|----------------------------------------------------------------------------------------|
| NF001 | Acessibilidade (WCAG 2.1)           | shadcn/ui (componentes ARIA), navegação por teclado, contraste AA, alt text em imagens |
| NF002 | Ajuda Contextual                    | Tooltips, popovers informativos, seção de ajuda com tutoriais por módulo               |
| NF003 | Multiplataforma                     | SPA React — roda em Chrome, Firefox, Edge, Safari; sem plugins                         |
| NF004 | Backup e Recuperação                | Backup diário agendado do PostgreSQL (pg_dump); storage seguro com redundância         |
| NF005 | Escalabilidade                      | Backend stateless; CORS configurado; assets estáticos otimizados                       |
| NF006 | Disponibilidade 99,5%               | Execução local; health check `/health`                                                 |

---

## 7. Validações de Negócio

| Regra                                  | Onde              | Implementação                                    |
|----------------------------------------|-------------------|--------------------------------------------------|
| CPF válido (módulo 11)                 | Frontend + Backend| `cpf-utils` (FE) / `validate_cpf()` (BE)         |
| CNPJ válido (módulo 11)                | Frontend + Backend| `cnpj-utils` (FE) / `validate_cnpj()` (BE)       |
| OAB válida (formato: UF + número)      | Frontend + Backend| Regex + validação de formato                     |
| CPF/CNPJ duplicado                     | Backend           | Unique constraint no DB + query de verificação   |
| Número de processo duplicado           | Backend           | Unique constraint no DB                          |
| OAB duplicada                          | Backend           | Unique constraint no DB                          |
| Não desativar com vínculos ativos      | Backend           | Verificação de FK antes de DELETE lógico         |
| Campos obrigatórios                    | Frontend + Backend| Zod schema (FE) + Marshmallow validators (BE)    |
| Valor da dívida > 0                    | Backend           | Marshmallow `validate.Range(min=0.01)`           |

---

## 8. Páginas do Frontend

| Módulo     | Páginas                                                |
|------------|--------------------------------------------------------|
| Clientes   | Listagem (com busca/filtros), Criação, Edição, Detalhe |
| Advogados  | Listagem (com busca/filtros), Criação, Edição, Detalhe |
| Processos  | Listagem (com busca/filtros), Criação, Edição, Detalhe |
| Devedores  | Listagem (com busca/filtros), Criação, Edição, Detalhe |
| Auth       | Login                                                  |
| Layout     | Sidebar, Header, Dashboard (futuro)                    |

---

## 9. Consequências

### Positivas

- **Separação de responsabilidades**: frontend e backend independentes, podem evoluir separadamente
- **Type safety ponta a ponta**: TypeScript no frontend, tipagem com Marshmallow no backend
- **Simplicidade**: sem autenticação, o sistema é direto — ideal para uso local em rede interna
- **Escalabilidade futura**: API stateless permite adicionar autenticação depois se necessário
- **Acessibilidade nativa**: shadcn/ui já segue WCAG 2.1 AA
- **Manutenibilidade**: estrutura modular por domínio (cliente, advogado, processo, devedor)
- **Validação completa**: 16/16 requisitos funcionais implementados (100%)
- **Build limpo**: 0 erros TypeScript, bundle otimizado

### Negativas / Trade-offs

- **Sem autenticação**: qualquer pessoa com acesso à rede pode usar o sistema — aceitável pois é uso local
- **Complexidade de deploy**: dois aplicativos separados (frontend + backend)
- **Overhead de rede**: comunicação HTTP entre frontend e backend (mitigado com bom design de API)
- **Flask é minimalista**: requer mais configuração manual que Django (mas oferece mais flexibilidade)
- **Verificação de vínculos**: 3 regras de negócio de desativação com verificação parcial (estrutura pronta)

---

## 10. Status da Implementação (Pós-Sprint 2)

### Requisitos Funcionais

| Módulo | RF | Status |
|--------|-----|--------|
| Cliente | RF001-RF004 | ✅ 100% |
| Processo | RF005-RF008 | ✅ 100% |
| Devedor | RF009-RF012 | ✅ 100% |
| Advogado | RF013-RF016 | ✅ 100% |
| **Total** | | **✅ 16/16 (100%)** |

### Artefatos Entregues

| Artefato | Status |
|----------|--------|
| Backend (Flask + PostgreSQL) | ✅ Completo |
| Frontend (React + TypeScript) | ✅ Completo |
| Migrations (Alembic) | ✅ Completo |
| Validação de Requisitos | ✅ `docs/validacao-requisitos.md` |
| Build frontend | ✅ 0 erros |

---

## 11. Decisões Futuras (Fora do Escopo da Sprint 2)

- [ ] Módulo de controle de prazos (integração com processos)
- [ ] Sistema de autenticação (se necessário para acesso remoto)
- [ ] Sistema de notificações (e-mail push)
- [ ] Dashboard com gráficos e métricas
- [ ] GED (Gestão Eletrônica de Documentos) — upload e versionamento
- [ ] Exportação de relatórios (PDF, CSV)
- [ ] Integração com sistemas parceiros via webhook
- [ ] Testes E2E (Playwright)
- [ ] Documentação OpenAPI/Swagger (flask-smorest)
- [ ] CI/CD (quando houver infra remota)
- [ ] Verificação completa de vínculos para desativação (3 regras pendentes)
