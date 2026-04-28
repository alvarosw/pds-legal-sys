import { Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onNew?: () => void
  onSearch?: (query: string) => void
  className?: string
}

export function Header({ onNew, onSearch, className }: HeaderProps) {
  return (
    <header className={cn('flex items-center gap-3 px-6 py-3', className)}>
      {onNew && (
        <button
          onClick={onNew}
          className="flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          aria-label="Criar novo registro"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo
        </button>
      )}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          placeholder="Pesquisar..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full rounded-lg border-0 bg-white py-2 pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Campo de pesquisa"
        />
      </div>
    </header>
  )
}
