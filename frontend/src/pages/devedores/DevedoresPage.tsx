import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { getDevedores } from '@/services/devedor.service'
import { formatCPFOrCNPJ, formatCurrency, formatDate } from '@/lib/formatters'
import type { Devedor } from '@/types'

export function DevedoresPage() {
  const [devedores, setDevedores] = useState<Devedor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const columns: Column<Devedor>[] = [
    {
      key: 'nome_razao_social',
      label: 'Nome/Razão Social',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/devedores/${row.id}`) }}
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
      const result = await getDevedores({ q, page: 1, per_page: 100 })
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

  if (loading && devedores.length === 0) {
    return (
      <div className="px-6 py-4">
        <Header onNew={() => navigate('/devedores/novo')} onSearch={setSearch} />
        <div className="px-6 pb-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <Header
        onNew={() => navigate('/devedores/novo')}
        onSearch={setSearch}
      />
      <div className="px-6 pb-6">
        <DataTable
          columns={columns}
          data={devedores}
          total={total}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}
