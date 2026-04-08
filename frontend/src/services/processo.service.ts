import { api } from '../services/api'
import type { Processo, PaginatedResponse, ApiError } from '../types'

export async function getProcessos(params?: { page?: number; per_page?: number; q?: string; sort?: string; order?: string }) {
  const { data } = await api.get<PaginatedResponse<Processo>>('/processos', { params })
  return data
}

export async function getProcessoById(id: string) {
  const { data } = await api.get<Processo>(`/processos/${id}`)
  return data
}

export async function createProcesso(payload: Omit<Processo, 'id' | 'ativo' | 'criado_em' | 'atualizado_em'>) {
  const { data } = await api.post<Processo>('/processos', payload)
  return data
}

export async function updateProcesso(id: string, payload: Partial<Processo>) {
  const { data } = await api.put<Processo>(`/processos/${id}`, payload)
  return data
}

export async function deactivateProcesso(id: string) {
  const { data } = await api.delete<Processo>(`/processos/${id}`)
  return data
}

export function isApiError(error: unknown): error is { response?: { data?: ApiError } } {
  return typeof error === 'object' && error !== null && 'response' in error
}

export function getProcessoErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data?.error?.message || 'Erro desconhecido'
  }
  return 'Erro de conexão'
}
