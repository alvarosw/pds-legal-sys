import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Usuario {
  id: string
  nome: string
  email: string
  is_admin?: boolean
  ativo: boolean
}

interface AuthState {
  token: string | null
  usuario: Usuario | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,

      login: (token, usuario) => {
        set({ token, usuario })
      },

      logout: () => {
        set({ token: null, usuario: null })
      },

      isAuthenticated: () => {
        const { token, usuario } = get()
        return !!token && !!usuario && usuario.ativo
      },

      isAdmin: () => {
        const { usuario } = get()
        return !!usuario?.is_admin
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
