import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { getProcessos, deactivateProcesso } from '@/services/processo.service'
import { formatDate, formatCurrency } from '@/lib/formatters'
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
  const navigate = useNavigate()

  const columns: Column<Processo>[] = [
    {
      key: 'numero_processo',
      label: 'Número',
      sortable: true,
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer">
          {String(value)}
        </span>
      )
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
      const result = await getProcessos({ q, page: 1, per_page: 100 })
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este processo?')) {
      try {
        await deactivateProcesso(id)
        await fetchProcessos(search)
        setSelectedId(null)
      } catch (err) {
        console.error('Erro ao desativar processo:', err)
        alert('Erro ao desativar processo')
      }
    }
  }

  if (loading && processos.length === 0) {
    return (
      <div className="px-6 py-4">
        <Header onNew={() => navigate('/processos/novo')} onSearch={setSearch} />
        <div className="px-6 pb-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <Header
        onNew={() => navigate('/processos/novo')}
        onSearch={setSearch}
      />
      <div className="px-6 pb-6">
        <DataTable
          columns={columns}
          data={processos}
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
