import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Clientes', href: '/clientes', ariaLabel: 'Ir para página de clientes' },
  { label: 'Devedores', href: '/devedores', ariaLabel: 'Ir para página de devedores' },
  { label: 'Processos', href: '/processos', ariaLabel: 'Ir para página de processos' },
  { label: 'Advogados', href: '/advogados', ariaLabel: 'Ir para página de advogados' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const userEmail = sessionStorage.getItem('userEmail') || ''
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Botão menu hambúrguer para mobile */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[14rem] flex-col bg-white transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="border-b px-4 py-4">
          <h1 className="text-lg font-bold">Gestão Jurídica</h1>
          {userEmail && (
            <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
          )}
        </div>
        <nav className="flex flex-1 flex-col justify-center space-y-1 px-4 py-6" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end
              aria-label={item.ariaLabel}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'block rounded px-4 py-2.5 text-base font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isActive
                    ? 'font-bold text-foreground underline underline-offset-4'
                    : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
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
    </>
  )
}
