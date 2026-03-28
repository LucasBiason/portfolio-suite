/**
 * @file DataTable.tsx
 * Generic reusable data table with column sorting, text search, pagination and per-row actions.
 * Supports client-side sorting (string and numeric), configurable page sizes and
 * optional edit/delete action buttons per row.
 */

import { useState, useMemo, useCallback, ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trash2 } from 'lucide-react'

/** Direction of the current column sort. `null` means unsorted. */
type SortDirection = 'asc' | 'desc' | null

/** Defines a single column in the DataTable. */
type Column<T> = {
  /** Object key used to read the cell value. */
  key: keyof T & string
  /** Text shown in the column header. */
  label: string
  /** Whether the column is sortable (default: true). */
  sortable?: boolean
  /** Custom cell renderer. Receives the raw value and the full row object. */
  render?: (value: unknown, row: T) => ReactNode
  /** Extra CSS class applied to both header and body cells. */
  className?: string
  /** When true, sorting compares values as numbers instead of strings. */
  numeric?: boolean
}

/** Props for the DataTable component. */
type DataTableProps<T extends { id: string }> = {
  /** Array of row data objects. Each item must have a unique `id` string. */
  data: T[]
  /** Column definitions controlling headers, sorting and rendering. */
  columns: Column<T>[]
  /** Keys of fields included in the full-text search filter. */
  searchFields?: (keyof T & string)[]
  /** Placeholder text for the search input. */
  searchPlaceholder?: string
  /** Called when the user clicks the edit button on a row. */
  onEdit?: (row: T) => void
  /** Called when the user clicks the delete button on a row. */
  onDelete?: (row: T) => void
  /** Number of rows per page (default: 10). */
  defaultPageSize?: number
  /** When true, shows a loading spinner instead of the table body. */
  loading?: boolean
  /** Text shown when no rows match the current search filter. */
  emptyMessage?: string
}

/** Renders the correct sort indicator icon based on the current sort direction. */
function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp size={14} className="text-accent" />
  if (direction === 'desc') return <ChevronDown size={14} className="text-accent" />
  return <ChevronsUpDown size={14} className="text-grey-20 opacity-50" />
}

/**
 * Renders a paginated, searchable and sortable data table.
 * All filtering, sorting and pagination are performed client-side on the provided `data` array.
 */
export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchFields,
  searchPlaceholder = 'Buscar...',
  onEdit,
  onDelete,
  defaultPageSize = 10,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Handle sort toggle
  const handleSort = useCallback((key: string) => {
    setSortDir((prev) => {
      if (sortKey !== key) return 'asc'
      if (prev === 'asc') return 'desc'
      if (prev === 'desc') return null
      return 'asc'
    })
    setSortKey(key)
    setPage(1)
  }, [sortKey])

  // Filtered data
  const filtered = useMemo(() => {
    if (!search.trim() || !searchFields?.length) return data
    const term = search.toLowerCase()
    return data.filter((row) =>
      searchFields.some((field) => {
        const val = row[field]
        if (typeof val === 'string') return val.toLowerCase().includes(term)
        if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(term))
        return String(val ?? '').toLowerCase().includes(term)
      })
    )
  }, [data, search, searchFields])

  // Sorted data
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered
    const col = columns.find((c) => c.key === sortKey)
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof T]
      const bVal = b[sortKey as keyof T]

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let cmp: number
      if (col?.numeric || (typeof aVal === 'number' && typeof bVal === 'number')) {
        cmp = Number(aVal) - Number(bVal)
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'pt-BR')
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [filtered, sortKey, sortDir, columns])

  // Paginated data
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize]
  )

  // Page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  const startItem = sorted.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, sorted.length)

  if (loading) {
    return (
      <div className="bg-surface border border-white/5 rounded-xl p-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
      {/* Toolbar: search + page size */}
      {(searchFields?.length || data.length > 10) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/5">
          {/* Search */}
          {searchFields?.length ? (
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-20" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 bg-background border border-white/10 rounded-lg text-sm font-body text-white placeholder:text-grey-20 focus:outline-none focus:border-primary/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-grey-20 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : <div />}

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-grey-20">Exibir</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="bg-background border border-white/10 rounded-lg px-2 py-1.5 text-xs font-body text-white focus:outline-none focus:border-primary/50"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-xs font-body text-grey-20">por página</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                const sortable = col.sortable !== false
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-grey-20 ${
                      sortable ? 'cursor-pointer hover:text-white select-none transition-colors' : ''
                    } ${col.className ?? ''}`}
                    onClick={sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {sortable && <SortIcon direction={isSorted ? sortDir : null} />}
                    </div>
                  </th>
                )
              })}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-body font-semibold uppercase tracking-wider text-grey-20 w-24">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm font-body text-grey-20"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-sm font-body text-grey-30 ${col.className ?? ''}`}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : Array.isArray(row[col.key])
                          ? (row[col.key] as unknown[]).length
                          : String(row[col.key] ?? '-')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-white/5">
          <p className="text-xs font-body text-grey-20">
            Exibindo {startItem}-{endItem} de {sorted.length} registros
            {search && ` (filtrado de ${data.length})`}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-grey-20 transition-colors"
              title="Primeira"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-grey-20 transition-colors"
              title="Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-body font-medium transition-colors ${
                  n === page
                    ? 'bg-primary text-white'
                    : 'text-grey-20 hover:text-white hover:bg-white/5'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-grey-20 transition-colors"
              title="Próxima"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-grey-20 transition-colors"
              title="Última"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
