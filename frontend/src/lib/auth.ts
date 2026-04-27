import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useRequireAuth() {
  const navigate = useNavigate()

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'

    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [navigate])
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem('isAuthenticated') === 'true'
}

export function logout() {
  sessionStorage.removeItem('isAuthenticated')
  sessionStorage.removeItem('userEmail')
}