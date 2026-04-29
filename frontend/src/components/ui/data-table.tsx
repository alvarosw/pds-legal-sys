import * as React from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OptionsButton } from './options-button'

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
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onReactivate?: (id: string) => void
}

const DataTableInternal = <T extends { id: string }>(
  {
    columns,
    data,
    total,
    selectedId,
    onSelect,
    onEdit,
    onDelete,
    onReactivate,
  }: DataTableProps<T>,
  ref: React.Ref<HTMLDivElement>
) => {
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1)
  const internalTableRef = React.useRef<HTMLDivElement>(null)
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      internalTableRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )

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

  const handleKeyDown = (event: React.KeyboardEvent, index: number, row: T) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (index < sortedData.length - 1) {
          setFocusedIndex(index + 1)
          onSelect?.(sortedData[index + 1].id)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (index > 0) {
          setFocusedIndex(index - 1)
          onSelect?.(sortedData[index - 1].id)
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect?.(row.id)
        break
      case 'e':
        if (onEdit) {
          event.preventDefault()
          onEdit(row.id)
        }
        break
      case 'd':
        if (onDelete) {
          event.preventDefault()
          onDelete(row.id)
        }
        break
      case 'r':
        if (onReactivate) {
          event.preventDefault()
          onReactivate(row.id)
        }
        break
    }
  }

  const handleTableKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (focusedIndex === -1 && sortedData.length > 0) {
          setFocusedIndex(0)
          onSelect?.(sortedData[0].id)
        } else if (focusedIndex < sortedData.length - 1) {
          setFocusedIndex(focusedIndex + 1)
          onSelect?.(sortedData[focusedIndex + 1].id)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1)
          onSelect?.(sortedData[focusedIndex - 1].id)
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (focusedIndex >= 0) {
          onSelect?.(sortedData[focusedIndex].id)
        }
        break
      case 'e':
        if (onEdit && focusedIndex >= 0) {
          event.preventDefault()
          onEdit(sortedData[focusedIndex].id)
        }
        break
      case 'd':
        if (onDelete && focusedIndex >= 0) {
          event.preventDefault()
          onDelete(sortedData[focusedIndex].id)
        }
        break
      case 'r':
        if (onReactivate && focusedIndex >= 0) {
          event.preventDefault()
          onReactivate(sortedData[focusedIndex].id)
        }
        break
    }
  }

  return (
    <div
      className="rounded-lg border bg-white shadow-sm"
      role="region"
      aria-label="Tabela de dados"
      tabIndex={0}
      ref={mergedRef}
      onKeyDown={handleTableKeyDown}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="text-sm text-muted-foreground">
          Total de Registros:{' '}
          <span className="font-medium text-foreground">{total ?? data.length}</span>
        </p>
        {selectedId && onEdit && onDelete && (
          <OptionsButton
            onEdit={() => onEdit(selectedId)}
            onDelete={() => onDelete(selectedId)}
            onReactivate={onReactivate ? () => onReactivate(selectedId) : undefined}
          />
        )}
      </div>
      <div className="overflow-auto max-h-[calc(100vh-16rem)]">
        <table className="w-full text-sm" role="table" aria-label="Dados">
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
                  scope="col"
                  aria-sort={
                    sortKey === col.key
                      ? sortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
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
                    : 'bg-white hover:bg-[hsl(var(--table-hover-bg))]',
                  focusedIndex === index && 'ring-2 ring-ring ring-offset-2'
                )}
                onClick={() => onSelect?.(row.id)}
                tabIndex={focusedIndex === index ? 0 : -1}
                role="row"
                aria-selected={row.id === selectedId}
                onKeyDown={(e) => handleKeyDown(e, index, row)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-2.5 text-foreground" role="cell">
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
                  role="cell"
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

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(DataTableInternal)
