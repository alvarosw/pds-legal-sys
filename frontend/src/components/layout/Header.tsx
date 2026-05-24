import { Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { KeyboardShortcutsHelp } from '../ui/keyboard-shortcuts-help'

interface HeaderProps {
  onNew?: () => void
  onSearch?: (query: string) => void
  className?: string
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

const listHeaderShortcuts = [
  { key: 'N', description: 'Novo registro' },
  { key: 'P', description: 'Focar campo de pesquisa' },
  { key: 'T', description: 'Focar tabela' },
  { key: 'Esc', description: 'Desfocar e limpar seleção' },
]

export const Header = forwardRef<HTMLDivElement, HeaderProps>(
  ({ onNew, onSearch, className, searchInputRef }, ref) => {
    return (
      <header className={cn('flex w-full justify-between items-center px-4 sm:px-6 py-3 gap-3', className)} ref={ref}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {onNew && (
            <button
              onClick={onNew}
              className="flex items-center gap-2 rounded-lg bg-white px-3 sm:px-5 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors whitespace-nowrap"
              aria-label="Criar novo registro"
            >
              <Plus className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          )}
          <div className="relative w-full max-w-sm min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full rounded-lg border-0 bg-white py-2 pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Campo de pesquisa"
            />
          </div>
        </div>
        <KeyboardShortcutsHelp shortcuts={listHeaderShortcuts} />
      </header>
    )
  }
)

Header.displayName = 'Header'
