export interface Cliente {
  id: string
  nome_completo: string
  cpf_cnpj: string
  telefone: string
  email?: string
  endereco: string
  observacoes?: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Advogado {
  id: string
  nome_completo: string
  numero_oab: string
  cpf: string
  email: string
  telefone?: string
  especialidade?: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Processo {
  id: string
  numero_processo: string
  tipo: string
  cliente_id: string
  data_abertura: string
  vara_comarca: string
  status: string
  advogado_resp_id?: string
  valor_causa?: number
  observacoes?: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Devedor {
  id: string
  nome_razao_social: string
  cpf_cnpj: string
  valor_divida: number
  data_divida: string
  origem_descricao: string
  contato?: string
  processo_id?: string
  observacoes?: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: { field: string; message: string }[]
  }
}
