import { Keyboard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Shortcut {
  key: string
  description: string
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Shortcut[]
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Atalhos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Na tabela:</strong>
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Navegar para cima</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                  ↑
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Navegar para baixo</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                  ↓
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Selecionar item</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Editar item selecionado</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                  E
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Excluir item selecionado</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                  D
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
