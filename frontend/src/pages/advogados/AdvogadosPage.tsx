import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { KeyboardShortcutsHelp } from '@/components/ui/keyboard-shortcuts-help'
import { getAdvogados, deactivateAdvogado } from '@/services/advogado.service'
import { formatCPF, formatPhone, formatOAB } from '@/lib/formatters'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import type { Advogado } from '@/types'

export function AdvogadosPage() {
  const [advogados, setAdvogados] = useState<Advogado[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const tableRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const shortcuts = [
    { key: 'N', description: 'Criar novo advogado' },
    { key: 'P', description: 'Focar campo de pesquisa' },
    { key: 'T', description: 'Focar tabela' },
    { key: 'Esc', description: 'Desfocar e limpar seleção' },
  ]

  const columns: Column<Advogado>[] = [
    {
      key: 'nome_completo',
      label: 'Nome',
      sortable: true,
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer">
          {String(value)}
        </span>
      )
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
      const result = await getAdvogados({ q, page: 1, per_page: 100 })
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este advogado?')) {
      try {
        await deactivateAdvogado(id)
        await fetchAdvogados(search)
        setSelectedId(null)
      } catch (err) {
        console.error('Erro ao desativar advogado:', err)
        alert('Erro ao desativar advogado')
      }
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

  // Atalhos de teclado
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
        <div className="flex justify-end mb-4">
          <KeyboardShortcutsHelp shortcuts={shortcuts} />
        </div>
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
    </div>
  )
}
