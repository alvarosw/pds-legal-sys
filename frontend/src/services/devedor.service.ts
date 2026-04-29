import { api } from '../services/api'
import type { Devedor, PaginatedResponse, ApiError } from '../types'

export async function getDevedores(params?: { page?: number; per_page?: number; q?: string; sort?: string; order?: string; include_inactive?: boolean }) {
  const { data } = await api.get<PaginatedResponse<Devedor>>('/devedores', { params })
  return data
}

export async function getDevedorById(id: string, includeInactive?: boolean) {
  const { data } = await api.get<Devedor>(`/devedores/${id}`, { params: { include_inactive: includeInactive } })
  return data
}

export async function createDevedor(payload: Omit<Devedor, 'id' | 'ativo' | 'criado_em' | 'atualizado_em'>) {
  const { data } = await api.post<Devedor>('/devedores', payload)
  return data
}

export async function updateDevedor(id: string, payload: Partial<Devedor>) {
  const { data } = await api.put<Devedor>(`/devedores/${id}`, payload)
  return data
}

export async function deactivateDevedor(id: string) {
  const { data } = await api.delete<Devedor>(`/devedores/${id}`)
  return data
}

export async function reactivateDevedor(id: string) {
  const { data } = await api.post<Devedor>(`/devedores/${id}/reactivate`)
  return data
}

export function isApiError(error: unknown): error is { response?: { data?: ApiError } } {
  return typeof error === 'object' && error !== null && 'response' in error
}

export function getDevedorErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data?.error?.message || 'Erro desconhecido'
  }
  return 'Erro de conexão'
}
