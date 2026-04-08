import * as React from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  total?: number
  selectedId?: string | null
  onSelect?: (id: string) => void
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  total,
  selectedId,
  onSelect,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortOrder])

  const SortIcon = ({ columnKey }: { columnKey: keyof T }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-1 h-3 w-3 text-muted-foreground" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
    )
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="text-sm text-muted-foreground">
          Total de Registros:{' '}
          <span className="font-medium text-foreground">{total ?? data.length}</span>
        </p>
        <button className="text-sm text-muted-foreground hover:text-foreground">
          Opções
          <ChevronDown className="inline ml-1 h-3 w-3" />
        </button>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-16rem)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[hsl(var(--table-header-bg))]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-2.5 text-left text-xs font-semibold text-foreground uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:bg-[hsl(var(--table-header-bg))] transition-colors'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  'border-t cursor-pointer transition-colors',
                  row.id === selectedId
                    ? 'bg-[hsl(var(--table-selected-bg))]'
                    : index % 2 === 0
                    ? 'bg-[hsl(var(--table-stripe-bg))] hover:bg-[hsl(var(--table-hover-bg))]'
                    : 'bg-white hover:bg-[hsl(var(--table-hover-bg))]'
                )}
                onClick={() => onSelect?.(row.id)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-2.5 text-foreground">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
