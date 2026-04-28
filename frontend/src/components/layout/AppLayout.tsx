import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useRequireAuth } from '@/lib/auth'

export function AppLayout() {
  useRequireAuth()

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]" role="main" aria-label="Área principal do aplicativo">
      <Sidebar />
      <div className="pl-[14rem]">
        <Outlet />
      </div>
    </div>
  )
}
