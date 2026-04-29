import { api } from '../services/api'
import type { Advogado, PaginatedResponse, ApiError } from '../types'

export async function getAdvogados(params?: { page?: number; per_page?: number; q?: string; sort?: string; order?: string; include_inactive?: boolean }) {
  const { data } = await api.get<PaginatedResponse<Advogado>>('/advogados', { params })
  return data
}

export async function getAdvogadoById(id: string, includeInactive?: boolean) {
  const { data } = await api.get<Advogado>(`/advogados/${id}`, { params: { include_inactive: includeInactive } })
  return data
}

export async function createAdvogado(payload: Omit<Advogado, 'id' | 'ativo' | 'criado_em' | 'atualizado_em'>) {
  const { data } = await api.post<Advogado>('/advogados', payload)
  return data
}

export async function updateAdvogado(id: string, payload: Partial<Advogado>) {
  const { data } = await api.put<Advogado>(`/advogados/${id}`, payload)
  return data
}

export async function deactivateAdvogado(id: string) {
  const { data } = await api.delete<Advogado>(`/advogados/${id}`)
  return data
}

export async function reactivateAdvogado(id: string) {
  const { data } = await api.post<Advogado>(`/advogados/${id}/reactivate`)
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
