# Frontend — SPA React

Interface web do Sistema de Gestão Jurídica.

## Stack

| Item | Versão |
|------|--------|
| React | 19.1 |
| TypeScript | 5.8 |
| Vite | 6.3 |
| React Router | 7.6 |
| Tailwind CSS | 3.4 |
| shadcn/ui | (Radix UI primitives) |
| TanStack Table | 8.21 |
| React Hook Form | 7.56 |
| Zod | 3.25 |
| Axios | 1.9 |
| Zustand | 5.0 |
| Lucide React | 0.511 |

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev       # Dev server com HMR (localhost:5173)
npm run build     # Build de produção (dist/)
npm run preview   # Preview do build de produção
```

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── badge.tsx          # Badge com variants (default, success, warning, destructive, etc.)
│   │   ├── button.tsx         # Botão com variants
│   │   ├── card.tsx           # Card container
│   │   ├── data-table.tsx     # Tabela genérica (TanStack Table)
│   │   ├── dialog.tsx         # Modal/Dialog (Radix)
│   │   ├── input.tsx          # Input text
│   │   ├── label.tsx          # Label acessível
│   │   ├── masked-input.tsx   # Input com máscara (CPF, CNPJ, telefone, OAB)
│   │   └── select.tsx         # Dropdown (Radix Select)
│   └── layout/
│       ├── AppLayout.tsx      # Layout principal (Sidebar + conteúdo)
│       ├── Header.tsx         # Header de página (título, botão novo, busca)
│       └── Sidebar.tsx        # Menu lateral
├── pages/
│   ├── clientes/
│   │   ├── ClientesPage.tsx         # Listagem com busca
│   │   ├── ClienteCriacaoPage.tsx   # Formulário de criação
│   │   └── ClienteEdicaoPage.tsx    # Formulário de edição + desativação
│   ├── advogados/          # Mesma estrutura
│   ├── devedores/          # Mesma estrutura
│   └── processos/          # Mesma estrutura
├── services/
│   ├── api.ts               # Instância Axios configurada
│   ├── cliente.service.ts   # Funções HTTP para Cliente
│   ├── advogado.service.ts
│   ├── processo.service.ts
│   └── devedor.service.ts
├── schemas/
│   └── index.ts             # Zod schemas para validação de formulários
├── types/
│   └── index.ts             # TypeScript interfaces
├── lib/
│   ├── formatters.ts        # Formatadores (CPF, CNPJ, telefone, moeda, data)
│   └── utils.ts             # Utilitários (cn para className merging)
└── routes/
    └── index.tsx            # Definição de rotas (React Router)
```

## Configuração da API

O endpoint base está em `src/services/api.ts`:

```typescript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
```

Para apontar para outro servidor, defina a variável de ambiente `VITE_API_URL`:

```bash
# .env.local
VITE_API_URL=http://meu-servidor:5000/api/v1
```

## Padrão de Componentes

### Páginas de Listagem (`*Page.tsx`)

- Busca dados via service com debounce (300ms)
- `DataTable` genérica com colunas configuráveis
- Botão "Novo" no Header → navega para `/*/novo`
- Clique no nome → navega para `/:id`
- Loading state e empty state

### Páginas de Criação (`*CriacaoPage.tsx`)

- `react-hook-form` + `zodResolver`
- Schema Zod em `schemas/index.ts`
- `MaskedInput` para CPF/CNPJ/telefone
- `Select` (Radix) para relacionamentos (cliente, advogado)
- Botão Salvar com loading state
- Tratamento de erro via `getErrorMessage()` do service
- Redirecionamento para listagem após sucesso

### Páginas de Edição (`*EdicaoPage.tsx`)

- `useParams` para obter ID da URL
- `useEffect` para buscar dados existentes (`getById`)
- `reset()` do hook form para pré-preencher
- Selects com `value` controlado para mostrar seleção atual
- Botão "Desativar" com `Dialog` de confirmação
- Mesmas validações da criação

## Validação de Formulários

Schemas Zod em `src/schemas/index.ts`:

| Schema | Campos |
|--------|--------|
| `clienteSchema` | nome_completo, cpf_cnpj, telefone, email, endereco, observacoes |
| `advogadoSchema` | nome_completo, numero_oab, cpf, email, telefone, especialidade |
| `processoSchema` | numero_processo, tipo, cliente_id, data_abertura, vara_comarca, status, advogado_resp_id, valor_causa, observacoes |
| `devedorSchema` | nome_razao_social, cpf_cnpj, valor_divida, data_divida, origem_descricao, contato, processo_id, observacoes |

Cada schema gera um tipo TypeScript via `z.infer`:

```typescript
export type ClienteFormData = z.infer<typeof clienteSchema>
```

## Services HTTP

Cada service exporta:

| Função | Descrição |
|--------|-----------|
| `get*()` | Lista com paginação (`PaginatedResponse<T>`) |
| `get*ById(id)` | Detalhe de um recurso |
| `create*(payload)` | Cria recurso (POST) |
| `update*(id, payload)` | Atualiza recurso (PUT) |
| `deactivate*(id)` | Desativa recurso (DELETE) |
| `get*ErrorMessage(error)` | Extrai mensagem de erro da resposta |

## Formatters (`src/lib/formatters.ts`)

| Função | Entrada | Saída |
|--------|---------|-------|
| `formatCPF` | `12345678900` | `123.456.789-00` |
| `formatCNPJ` | `12345678000100` | `12.345.678/0001-00` |
| `formatCPFOrCNPJ` | string numérica | Formatado conforme tamanho |
| `formatPhone` | `11999998888` | `(11) 99999-8888` |
| `formatOAB` | `SP123456` | `SP 123456` |
| `formatCurrency` | `1500.50` | `R$ 1.500,50` |
| `formatDate` | `2026-04-08` | `08/04/2026` |

## Roteamento

Rotas definidas em `src/routes/index.tsx`:

| Rota | Componente |
|------|-----------|
| `/` | Dashboard (placeholder) |
| `/clientes` | ClientesPage |
| `/clientes/novo` | ClienteCriacaoPage |
| `/clientes/:id` | ClienteEdicaoPage |
| `/advogados` | AdvogadosPage |
| `/advogados/novo` | AdvogadoCriacaoPage |
| `/advogados/:id` | AdvogadoEdicaoPage |
| `/processos` | ProcessosPage |
| `/processos/novo` | ProcessoCriacaoPage |
| `/processos/:id` | ProcessoEdicaoPage |
| `/devedores` | DevedoresPage |
| `/devedores/novo` | DevedorCriacaoPage |
| `/devedores/:id` | DevedorEdicaoPage |

Layout envolvente: `AppLayout` (Sidebar + área de conteúdo).

## Build

```bash
npm run build
```

Output em `dist/`. Bundle size atual: ~534KB (164KB gzip). Zero erros TypeScript.

## Path Alias

`@` resolve para `src/`:

```typescript
import { Button } from '@/components/ui/button'
// Resolve para src/components/ui/button.tsx
```

Configurado em `vite.config.ts` + `tsconfig.json`.
