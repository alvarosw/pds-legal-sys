import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'

const navItems = [
  { label: 'Clientes', href: '/clientes' },
  { label: 'Devedores', href: '/devedores' },
  { label: 'Processos', href: '/processos' },
  { label: 'Advogados', href: '/advogados' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const userEmail = sessionStorage.getItem('userEmail') || 'Usuário'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 flex w-[14rem] flex-col bg-white"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="border-b px-4 py-4">
        <h1 className="text-lg font-bold">Gestão Jurídica</h1>
        <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
      </div>
      <nav className="flex flex-1 flex-col justify-center space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end
            className={({ isActive }) =>
              cn(
                'block rounded px-4 py-2.5 text-base font-normal transition-colors',
                isActive
                  ? 'font-bold text-foreground underline underline-offset-4'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full rounded px-4 py-2 text-left text-sm text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
