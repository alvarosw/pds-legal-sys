import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { getAdvogados } from '@/services/advogado.service'
import { formatCPF, formatPhone, formatOAB } from '@/lib/formatters'
import type { Advogado } from '@/types'

export function AdvogadosPage() {
  const [advogados, setAdvogados] = useState<Advogado[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const columns: Column<Advogado>[] = [
    {
      key: 'nome_completo',
      label: 'Nome',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/advogados/${row.id}`) }}
          className="text-blue-600 hover:underline text-left bg-transparent border-0 p-0 cursor-pointer font-normal"
        >
          {String(value)}
        </button>
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

  if (loading && advogados.length === 0) {
    return (
      <div className="px-6 py-4">
        <Header onNew={() => navigate('/advogados/novo')} onSearch={setSearch} />
        <div className="px-6 pb-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <Header
        onNew={() => navigate('/advogados/novo')}
        onSearch={setSearch}
      />
      <div className="px-6 pb-6">
        <DataTable
          columns={columns}
          data={advogados}
          total={total}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}
