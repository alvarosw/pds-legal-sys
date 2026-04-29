import { api } from '../services/api'
import type { Cliente, PaginatedResponse, ApiError } from '../types'

export async function getClientes(params?: { page?: number; per_page?: number; q?: string; sort?: string; order?: string; include_inactive?: boolean }) {
  const { data } = await api.get<PaginatedResponse<Cliente>>('/clientes', { params })
  return data
}

export async function getClienteById(id: string, includeInactive?: boolean) {
  const { data } = await api.get<Cliente>(`/clientes/${id}`, { params: { include_inactive: includeInactive } })
  return data
}

export async function createCliente(payload: Omit<Cliente, 'id' | 'ativo' | 'criado_em' | 'atualizado_em'>) {
  const { data } = await api.post<Cliente>('/clientes', payload)
  return data
}

export async function updateCliente(id: string, payload: Partial<Cliente>) {
  const { data } = await api.put<Cliente>(`/clientes/${id}`, payload)
  return data
}

export async function deactivateCliente(id: string) {
  const { data } = await api.delete<Cliente>(`/clientes/${id}`)
  return data
}

export async function reactivateCliente(id: string) {
  const { data } = await api.post<Cliente>(`/clientes/${id}/reactivate`)
  return data
}

export function isApiError(error: unknown): error is { response?: { data?: ApiError } } {
  return typeof error === 'object' && error !== null && 'response' in error
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data?.error?.message || 'Erro desconhecido'
  }
  return 'Erro de conexão'
}
