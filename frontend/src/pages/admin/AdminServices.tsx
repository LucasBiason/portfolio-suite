/**
 * @file AdminServices.tsx
 * Admin page for managing professional service offerings shown on the portfolio.
 * Provides a filterable, sortable list with a modal form for creating and editing services.
 */

import { FC, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronsUpDown,
  Layers,
  Pencil,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import type { Service } from '@/types'
import {
  fetchFilteredServices,
  createService,
  updateService,
  deleteService,
} from '@/services/api'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { FormField } from './components/FormField'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Sort direction for the services table columns. */
type SortDir = 'asc' | 'desc' | null

/** Extends the public Service type with the admin-required id and order fields. */
type ServiceWithId = Service & { id: string; order?: number }

/** Controlled form state for creating or editing a service entry. */
type ServiceForm = {
  title: string
  description: string
  icon: string
  order: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a blank ServiceForm initialised with sensible defaults. */
const emptyForm = (): ServiceForm => ({
  title: '',
  description: '',
  icon: '',
  order: '0',
})

/** Maps a ServiceWithId API object into the controlled form shape for editing. */
const serviceToForm = (s: ServiceWithId): ServiceForm => ({
  title: s.title,
  description: s.description,
  icon: s.icon,
  order: String(s.order ?? 0),
})

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders the sort direction indicator icon for a table column header. */
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ChevronUp size={14} className="text-accent" />
  if (dir === 'desc') return <ChevronDown size={14} className="text-accent" />
  return <ChevronsUpDown size={14} className="text-grey-20 opacity-50" />
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Renders the admin services management page.
 * Allows creating, editing and deleting service offering entries.
 * Used at the /admin/services route.
 */
export const AdminServices: FC = () => {
  // Server data
  const [services, setServices] = useState<ServiceWithId[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // All services (unfiltered) for stats
  const [allServices, setAllServices] = useState<ServiceWithId[]>([])

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 350)
  }

  // Load all services once for stats
  useEffect(() => {
    void fetchFilteredServices({ pageSize: 500 }).then((r) => {
      setAllServices(r.data as ServiceWithId[])
    }).catch(() => undefined)
  }, [])

  // Load services whenever filter/sort/page changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchFilteredServices({
        search: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir: sortDir ?? undefined,
      })
      setServices(result.data as ServiceWithId[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, sortBy, sortDir])

  useEffect(() => { void load() }, [load])

  // Pagination helpers
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, total)

  // Sort toggle
  const handleSort = (key: string) => {
    if (sortBy !== key) {
      setSortBy(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else if (sortDir === 'desc') {
      setSortDir(null)
    } else {
      setSortDir('asc')
    }
    setPage(1)
  }

  // Modal openers
  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (s: ServiceWithId) => {
    setEditingId(s.id)
    setForm(serviceToForm(s))
    setError(null)
    setModalOpen(true)
  }

  const set = (field: keyof ServiceForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  // Form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      order: parseInt(form.order, 10) || 0,
    }

    try {
      if (editingId) {
        await updateService(editingId, payload)
      } else {
        await createService(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteService(deleteId)
      setDeleteId(null)
      await load()
    } catch {
      setError('Erro ao excluir serviço')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tableColumns: { key: string; label: string; className?: string }[] = [
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição' },
    { key: 'icon', label: 'Ícone' },
    { key: 'order', label: 'Ordem', className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader
        title="Serviços"
        subtitle={`${total} serviço${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
        onAdd={openAdd}
        addLabel="Novo serviço"
        icon={<Wrench size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">
          {error}
        </div>
      )}

      {/* Stats */}
      {allServices.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <StatCard label="Total de servicos" value={allServices.length} icon={Wrench}
            cornerColor="from-accent to-primary" iconBg="bg-accent/20" iconColor="text-accent" />
          <StatCard label="Com icone" value={allServices.filter((s) => !!s.icon).length} icon={Layers}
            cornerColor="from-green to-green/60" iconBg="bg-green/20" iconColor="text-green" />
        </div>
      )}

      {/* Filter block */}
      <div className="bg-surface rounded-xl border border-white/5 p-5 mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-20" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar serviços..."
            className="w-full pl-9 pr-8 py-2 bg-background border border-white/10 rounded-lg text-sm font-body text-white placeholder:text-grey-20 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-grey-20 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {tableColumns.map((col) => {
                      const isSorted = sortBy === col.key
                      return (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className={`px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-grey-20 cursor-pointer hover:text-white select-none transition-colors ${col.className ?? ''}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            <SortIcon dir={isSorted ? sortDir : null} />
                          </div>
                        </th>
                      )
                    })}
                    <th className="px-4 py-3 text-right text-xs font-body font-semibold uppercase tracking-wider text-grey-20 w-24">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableColumns.length + 1}
                        className="px-4 py-12 text-center text-sm font-body text-grey-20"
                      >
                        Nenhum serviço cadastrado.
                      </td>
                    </tr>
                  ) : (
                    services.map((svc) => (
                      <tr
                        key={svc.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {svc.title}
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-20 max-w-xs truncate">
                          {svc.description}
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {svc.icon
                            ? <i className={`bx ${svc.icon} text-lg text-accent`} />
                            : <span className="text-grey-20">-</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-30 text-center">
                          {svc.order ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(svc)}
                              className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteId(svc.id)}
                              className="p-1.5 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-white/5">
                <p className="text-xs font-body text-grey-20">
                  Exibindo {startItem}–{endItem} de {total} registros
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
                    title="Proxima"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-grey-20 transition-colors"
                    title="Ultima"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit / Add modal */}
      {modalOpen && (
        <Modal
          title={editingId ? 'Editar serviço' : 'Novo serviço'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Título"
              value={form.title}
              onChange={(e) => set('title')(e.target.value)}
              required
              placeholder="Ex: Desenvolvimento Backend"
            />

            <FormField
              as="textarea"
              label="Descrição"
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              rows={3}
              placeholder="Descrição do serviço"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Ícone"
                value={form.icon}
                onChange={(e) => set('icon')(e.target.value)}
                placeholder="Ex: Code2"
                hint="Nome do ícone lucide-react"
              />
              <FormField
                label="Ordem"
                type="number"
                value={form.order}
                onChange={(e) => set('order')(e.target.value)}
                placeholder="0"
              />
            </div>

            {error && <p className="text-red text-sm font-body">{error}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-body text-grey-30 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-body font-semibold bg-primary hover:bg-primary-dark disabled:opacity-50 text-white transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          message="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
