import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function useRequireAuth() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)

  if (!token) {
    navigate('/login', { replace: true })
  }

  return { token }
}

export function logout() {
  useAuthStore.getState().logout()
}