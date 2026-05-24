import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]" role="main" aria-label="Área principal do aplicativo">
      <Sidebar />
      <div className="pl-[14rem]">
        <Outlet />
      </div>
    </div>
  )
}
