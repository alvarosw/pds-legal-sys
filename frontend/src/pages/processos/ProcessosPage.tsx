import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { getProcessos, deactivateProcesso } from '@/services/processo.service'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useToast } from '@/components/ui/toast'
import type { Processo } from '@/types'

const statusVariant = (status: string) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
    'Aberto': 'default',
    'Em Andamento': 'success',
    'Suspenso': 'warning',
    'Encerrado': 'secondary',
    'Arquivado': 'destructive',
  }
  return map[status] || 'default'
}

export function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [processoToDelete, setProcessoToDelete] = useState<string | null>(null)
  const navigate = useNavigate()
  const tableRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
const { error } = useToast()

  const columns: Column<Processo>[] = [
    {
      key: 'numero_processo',
      label: 'Número',
      sortable: true,
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
    },
    {
      key: 'vara_comarca',
      label: 'Vara/Comarca',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={statusVariant(String(value))}>
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'valor_causa',
      label: 'Valor da Causa',
      sortable: true,
      render: (value) => (
        <span className="font-semibold">
          {value ? formatCurrency(Number(value)) : '-'}
        </span>
      ),
    },
    {
      key: 'data_abertura',
      label: 'Data Abertura',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
    {
      key: 'ativo',
      label: 'Ativo',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'destructive'}>
          {value ? 'Sim' : 'Não'}
        </Badge>
      ),
    },
  ]

  const fetchProcessos = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const result = await getProcessos({ q, page: 1, per_page: 100, include_inactive: true })
      setProcessos(result.data)
      setTotal(result.pagination.total)
    } catch (err) {
      console.error('Erro ao buscar processos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProcessos()
  }, [fetchProcessos])

  useEffect(() => {
    const timer = setTimeout(() => fetchProcessos(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchProcessos])

  const handleEdit = (id: string) => {
    navigate(`/processos/${id}`)
  }

  const handleDelete = (id: string) => {
    setProcessoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!processoToDelete) return
    try {
      await deactivateProcesso(processoToDelete)
      await fetchProcessos(search)
      setSelectedId(null)
      setProcessoToDelete(null)
    } catch (err: any) {
      console.error('Erro ao desativar processo:', err)
      if (err.response?.data?.error?.message) {
        error('Erro ao desativar', err.response.data.error.message)
      } else {
        error('Erro ao desativar', 'Não foi possível desativar este processo')
      }
    } finally {
      setProcessoToDelete(null)
    }
  }

  const handleNew = () => {
    navigate('/processos/novo')
  }

  const handleSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const handleTable = () => {
    if (tableRef.current) {
      tableRef.current.focus()
    }
  }

  const handleEscape = () => {
    setSelectedId(null)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  useKeyboardShortcuts([
    {
      key: 'n',
      action: handleNew,
      description: 'Criar novo processo',
    },
    {
      key: 'p',
      action: handleSearch,
      description: 'Focar campo de pesquisa',
    },
    {
      key: 't',
      action: handleTable,
      description: 'Focar tabela',
    },
    {
      key: 'escape',
      action: handleEscape,
      description: 'Desfocar e limpar seleção',
    },
  ])

  if (loading && processos.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-4">
        <Header onNew={handleNew} onSearch={setSearch} searchInputRef={searchInputRef} />
        <div className="px-4 sm:px-6 pb-6 overflow-x-auto">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-4">
      <Header
        onNew={handleNew}
        onSearch={setSearch}
        searchInputRef={searchInputRef}
      />
      <div className="px-4 sm:px-6 pb-6 overflow-x-auto">
        <DataTable
          ref={tableRef}
          columns={columns}
          data={processos}
          total={total}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setProcessoToDelete(null)
        }}
        title="Confirmar exclusão"
        description="Tem certeza que deseja desativar este processo?"
        confirmLabel="Desativar"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
