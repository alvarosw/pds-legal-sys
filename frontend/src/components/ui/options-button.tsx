import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OptionsButtonProps {
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}

export function OptionsButton({ onEdit, onDelete, disabled = false }: OptionsButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-sm px-3 py-1.5 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          disabled={disabled}
          aria-label="Opções"
          aria-haspopup="menu"
        >
          Opções
          <ChevronDown className="inline ml-1 h-3 w-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit} className="focus:bg-accent focus:text-accent-foreground">
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:bg-accent focus:text-accent-foreground">
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}