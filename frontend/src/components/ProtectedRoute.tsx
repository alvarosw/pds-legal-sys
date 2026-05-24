import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin } = useAuthStore()
  const isAuth = isAuthenticated()
  const isUserAdmin = isAdmin()

  useEffect(() => {
    if (!isAuth) {
      navigate('/login', { replace: true })
    } else if (requireAdmin && !isUserAdmin) {
      navigate('/clientes', { replace: true })
    }
  }, [isAuth, isUserAdmin, requireAdmin, navigate])

  if (!isAuth) {
    return null
  }

  if (requireAdmin && !isUserAdmin) {
    return null
  }

  return <>{children}</>
}
