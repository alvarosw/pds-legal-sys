import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'

const navItems = [
  { label: 'Clientes', href: '/clientes', ariaLabel: 'Ir para página de clientes' },
  { label: 'Devedores', href: '/devedores', ariaLabel: 'Ir para página de devedores' },
  { label: 'Processos', href: '/processos', ariaLabel: 'Ir para página de processos' },
  { label: 'Advogados', href: '/advogados', ariaLabel: 'Ir para página de advogados' },
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
      <nav className="flex flex-1 flex-col justify-center space-y-1 px-4 py-6" aria-label="Navegação principal">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end
            aria-label={item.ariaLabel}
            className={({ isActive }) =>
              cn(
                'block rounded px-4 py-2.5 text-base font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
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
          className="w-full rounded px-4 py-2 text-left text-sm text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Sair do sistema"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
