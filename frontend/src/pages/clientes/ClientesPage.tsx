import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { getClientes, deactivateCliente } from '@/services/cliente.service'
import { formatCPFOrCNPJ, formatPhone } from '@/lib/formatters'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import type { Cliente } from '@/types'

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const tableRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const columns: Column<Cliente>[] = [
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
      key: 'cpf_cnpj',
      label: 'CPF/CNPJ',
      sortable: true,
      render: (value) => formatCPFOrCNPJ(String(value)),
    },
    {
      key: 'telefone',
      label: 'Telefone',
      sortable: true,
      render: (value) => formatPhone(String(value)),
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
      key: 'endereco',
      label: 'Endereço',
      sortable: true,
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

  const fetchClientes = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const result = await getClientes({ q, page: 1, per_page: 100 })
      setClientes(result.data)
      setTotal(result.pagination.total)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  useEffect(() => {
    const timer = setTimeout(() => fetchClientes(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchClientes])

  const handleEdit = (id: string) => {
    navigate(`/clientes/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este cliente?')) {
      try {
        await deactivateCliente(id)
        await fetchClientes(search)
        setSelectedId(null)
      } catch (err) {
        console.error('Erro ao desativar cliente:', err)
        alert('Erro ao desativar cliente')
      }
    }
  }

  const handleNew = () => {
    navigate('/clientes/novo')
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
      description: 'Criar novo cliente',
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

  if (loading && clientes.length === 0) {
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
          data={clientes}
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
