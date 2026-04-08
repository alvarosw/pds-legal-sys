import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { getClientes } from '@/services/cliente.service'
import { formatCPFOrCNPJ, formatPhone } from '@/lib/formatters'
import type { Cliente } from '@/types'

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const columns: Column<Cliente>[] = [
    {
      key: 'nome_completo',
      label: 'Nome',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${row.id}`) }}
          className="text-blue-600 hover:underline text-left bg-transparent border-0 p-0 cursor-pointer font-normal"
        >
          {String(value)}
        </button>
      ),
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
      label: 'Cidade',
      sortable: true,
      render: (value) => {
        const cidade = String(value || '').split(',')[0]
        return cidade
      },
    },
    {
      key: 'endereco',
      label: 'UF',
      sortable: true,
      render: (value) => {
        const parts = String(value || '').split(',').map(s => s.trim())
        return parts[1] || ''
      },
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

  if (loading && clientes.length === 0) {
    return (
      <div className="px-6 py-4">
        <Header onNew={() => navigate('/clientes/novo')} onSearch={setSearch} />
        <div className="px-6 pb-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <Header
        onNew={() => navigate('/clientes/novo')}
        onSearch={setSearch}
      />
      <div className="px-6 pb-6">
        <DataTable
          columns={columns}
          data={clientes}
          total={total}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}
