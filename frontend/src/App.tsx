import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes'
import { initializeAuth } from './services/auth.service'
import { useEffect } from 'react'

export function App() {
  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
