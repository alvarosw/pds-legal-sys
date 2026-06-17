import { api } from './api'
import type { Usuario } from '@/stores/auth'

interface LoginCredentials {
  email: string
  senha: string
}

interface LoginResponse {
  token: string
  usuario: Usuario
}

export async function login({ email, senha }: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, senha })
    return response.data
  } catch (err: any) {
    console.log(err.response)
    throw new Error(err.response?.data?.error?.message || 'Erro ao fazer login. Verifique suas credenciais.')
  }
}

export async function getUsuarios(params?: { page?: number; per_page?: number; q?: string }) {
  const response = await api.get<{ data: Usuario[] }>('/usuarios', { params })
  return response.data
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Inicializa o token do localStorage
export function initializeAuth() {
  const stored = localStorage.getItem('auth-storage')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed?.state?.token) {
        setAuthToken(parsed.state.token)
      }
    } catch {
      // Ignora erros de parse
    }
  }
}
