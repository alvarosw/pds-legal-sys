import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { getDevedores, deactivateDevedor } from '@/services/devedor.service'
import { formatCPFOrCNPJ, formatCurrency, formatDate } from '@/lib/formatters'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useToast } from '@/components/ui/toast'
import type { Devedor } from '@/types'

export function DevedoresPage() {
  const [devedores, setDevedores] = useState<Devedor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [devedorToDelete, setDevedorToDelete] = useState<string | null>(null)
  const navigate = useNavigate()
  const tableRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
const { error } = useToast()

  const columns: Column<Devedor>[] = [
    {
      key: 'nome_razao_social',
      label: 'Nome/Razão Social',
      sortable: true,
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'cpf_cnpj',
      label: 'CPF/CNPJ',
      sortable: true,
      render: (value) => formatCPFOrCNPJ(String(value)),
    },
    {
      key: 'valor_divida',
      label: 'Valor da Dívida',
      sortable: true,
      render: (value) => (
        <span className="text-red-600 font-semibold">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      key: 'data_divida',
      label: 'Data da Dívida',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
    {
      key: 'origem_descricao',
      label: 'Origem',
      sortable: false,
      render: (value) => (
        <span className="max-w-xs truncate block" title={String(value)}>
          {String(value).substring(0, 40)}{String(value).length > 40 ? '...' : ''}
        </span>
      ),
    },
    {
      key: 'contato',
      label: 'Contato',
      sortable: false,
      render: (value) => (
        <span className={value ? 'text-blue-600 hover:underline' : 'text-muted-foreground'}>
          {value || 'Não informado'}
        </span>
      ),
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

  const fetchDevedores = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const result = await getDevedores({ q, page: 1, per_page: 100, include_inactive: true })
      setDevedores(result.data)
      setTotal(result.pagination.total)
    } catch (err) {
      console.error('Erro ao buscar devedores:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDevedores()
  }, [fetchDevedores])

  useEffect(() => {
    const timer = setTimeout(() => fetchDevedores(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchDevedores])

  const handleEdit = (id: string) => {
    navigate(`/devedores/${id}`)
  }

  const handleDelete = (id: string) => {
    setDevedorToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!devedorToDelete) return
    try {
      await deactivateDevedor(devedorToDelete)
      await fetchDevedores(search)
      setSelectedId(null)
      setDevedorToDelete(null)
    } catch (err: any) {
      console.error('Erro ao desativar devedor:', err)
      if (err.response?.data?.error?.message) {
        error(`Erro: ${err.response.data.error.message}`)
      } else {
        error('Erro ao desativar', 'Não foi possível desativar este devedor')
      }
    } finally {
      setDevedorToDelete(null)
    }
  }

  const handleNew = () => {
    navigate('/devedores/novo')
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
      description: 'Criar novo devedor',
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

  if (loading && devedores.length === 0) {
    return (
      <div className="px-6 py-4">
        <Header onNew={handleNew} onSearch={setSearch} searchInputRef={searchInputRef} />
        <div className="px-6 pb-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <Header
        onNew={handleNew}
        onSearch={setSearch}
        searchInputRef={searchInputRef}
      />
      <div className="px-6 pb-6">
        <DataTable
          ref={tableRef}
          columns={columns}
          data={devedores}
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
          if (!open) setDevedorToDelete(null)
        }}
        title="Confirmar exclusão"
        description="Tem certeza que deseja desativar este devedor?"
        confirmLabel="Desativar"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
