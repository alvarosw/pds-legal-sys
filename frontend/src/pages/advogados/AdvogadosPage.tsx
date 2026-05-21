import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { getAdvogados, deactivateAdvogado } from '@/services/advogado.service'
import { formatCPF, formatPhone, formatOAB } from '@/lib/formatters'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useToast } from '@/components/ui/toast'
import type { Advogado } from '@/types'

export function AdvogadosPage() {
  const [advogados, setAdvogados] = useState<Advogado[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [advogadoToDelete, setAdvogadoToDelete] = useState<string | null>(null)
  const navigate = useNavigate()
  const tableRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
const { error } = useToast()

  const columns: Column<Advogado>[] = [
    {
      key: 'nome_completo',
      label: 'Nome',
      sortable: true,
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'numero_oab',
      label: 'OAB',
      sortable: true,
      render: (value) => formatOAB(String(value)),
    },
    {
      key: 'cpf',
      label: 'CPF',
      sortable: true,
      render: (value) => formatCPF(String(value)),
    },
    {
      key: 'telefone',
      label: 'Telefone',
      sortable: true,
      render: (value) => value ? formatPhone(String(value)) : '—',
    },
    {
      key: 'email',
      label: 'E-mail',
      sortable: false,
      render: (value) => (
        <span className={value ? 'text-blue-600 hover:underline' : 'text-muted-foreground'}>
          {value || 'Não disponível'}
        </span>
      ),
    },
    {
      key: 'especialidade',
      label: 'Especialidade',
      sortable: true,
      render: (value) => value || '—',
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

  const fetchAdvogados = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const result = await getAdvogados({ q, page: 1, per_page: 100, include_inactive: true })
      setAdvogados(result.data)
      setTotal(result.pagination.total)
    } catch (err) {
      console.error('Erro ao buscar advogados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdvogados()
  }, [fetchAdvogados])

  useEffect(() => {
    const timer = setTimeout(() => fetchAdvogados(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchAdvogados])

  const handleEdit = (id: string) => {
    navigate(`/advogados/${id}`)
  }

  const handleDelete = (id: string) => {
    setAdvogadoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!advogadoToDelete) return
    try {
      await deactivateAdvogado(advogadoToDelete)
      await fetchAdvogados(search)
      setSelectedId(null)
      setAdvogadoToDelete(null)
    } catch (err: any) {
      console.error('Erro ao desativar advogado:', err)
      if (err.response?.data?.error?.message) {
        error(`Erro: ${err.response.data.error.message}`)
      } else {
        error('Erro ao desativar', 'Não foi possível desativar este advogado')
      }
    } finally {
      setAdvogadoToDelete(null)
    }
  }

  const handleNew = () => {
    navigate('/advogados/novo')
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
      description: 'Criar novo advogado',
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

  if (loading && advogados.length === 0) {
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
          data={advogados}
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
          if (!open) setAdvogadoToDelete(null)
        }}
        title="Confirmar exclusão"
        description="Tem certeza que deseja desativar este advogado?"
        confirmLabel="Desativar"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
