import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { token, isAdmin } = useAuthStore()
  const isUserAdmin = isAdmin()

  useEffect(() => {
    // Só redireciona para /login se não existir token no localStorage
    if (!token) {
      navigate('/login', { replace: true })
    } else if (requireAdmin && !isUserAdmin) {
      navigate('/clientes', { replace: true })
    }
  }, [token, isUserAdmin, requireAdmin, navigate])

  // Renderiza null apenas se não houver token (foi renderizado antes da verificação completar)
  if (!token) {
    return null
  }

  if (requireAdmin && !isUserAdmin) {
    return null
  }

  return <>{children}</>
}
