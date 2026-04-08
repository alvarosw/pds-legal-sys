import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Clientes', href: '/clientes' },
  { label: 'Devedores', href: '/devedores' },
  { label: 'Processos', href: '/processos' },
  { label: 'Advogados', href: '/advogados' },
]

export function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 flex w-[14rem] flex-col bg-white"
      role="navigation"
      aria-label="Menu principal"
    >
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
    </aside>
  )
}
