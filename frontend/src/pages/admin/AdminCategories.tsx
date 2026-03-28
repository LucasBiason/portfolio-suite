/**
 * @file AdminCategories.tsx
 * Admin page for managing project and stack categories.
 * Provides a filterable, sortable list with a modal form for creating and editing categories.
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
  Tag,
  Palette,
  Pencil,
  Search,
  Trash2,
  X,
  Layers,
  FolderKanban,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { FormField } from './components/FormField'
import { ConfirmDialog } from './components/ConfirmDialog'
import {
  fetchAdminCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from '@/services/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Represents a category record returned by the admin API. */
type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  order: number
}

/** Controlled form state for creating or editing a category. */
type CategoryForm = {
  name: string
  slug: string
  icon: string
  color: string
  order: string
}

/** Sort direction for the categories table columns. */
type SortDir = 'asc' | 'desc' | null

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10

const TYPES = [
  { key: 'project', label: 'Projeto', color: '#5e81ac' },
  { key: 'stack', label: 'Stack', color: '#a3be8c' },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a blank CategoryForm initialised with sensible defaults. */
const emptyForm = (): CategoryForm => ({
  name: '',
  slug: '',
  icon: '',
  color: '#5e81ac',
  order: '0',
})

/** Maps a Category API object into the controlled form shape for editing. */
const toForm = (c: Category): CategoryForm => ({
  name: c.name,
  slug: c.slug,
  icon: c.icon ?? '',
  color: c.color ?? '#5e81ac',
  order: String(c.order),
})

/**
 * Infers the display type of a category based on its order value.
 * Categories with order >= 100 are treated as stack categories.
 */
function getCategoryType(c: Category): 'project' | 'stack' {
  return c.order >= 100 ? 'stack' : 'project'
}

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
 * Renders the admin categories management page.
 * Allows creating, editing and deleting both project and stack categories.
 * Used at the /admin/categories route.
 */
export const AdminCategories: FC = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Modal / form
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 350)
  }

  // Load
  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAllCategories(await fetchAdminCategories() as Category[])
    } catch {
      setError('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  // Filtered + sorted data (client-side, small dataset)
  const filtered = useMemo(() => {
    let data = allCategories

    if (selectedType) {
      data = data.filter((c) => getCategoryType(c) === selectedType)
    }

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase()
      data = data.filter((c) =>
        c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term)
      )
    }

    if (sortBy && sortDir) {
      data = [...data].sort((a, b) => {
        const aVal = a[sortBy as keyof Category]
        const bVal = b[sortBy as keyof Category]
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1
        let cmp: number
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal
        } else {
          cmp = String(aVal).localeCompare(String(bVal), 'pt-BR')
        }
        return sortDir === 'desc' ? -cmp : cmp
      })
    }

    return data
  }, [allCategories, selectedType, debouncedSearch, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const startItem = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, filtered.length)

  // Pagination numbers
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

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

  // Modal
  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (c: Category) => {
    setEditingId(c.id)
    setForm(toForm(c))
    setError(null)
    setModalOpen(true)
  }

  const set = (field: keyof CategoryForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        icon: form.icon || undefined,
        color: form.color || undefined,
        order: parseInt(form.order, 10) || 0,
      }
      if (editingId) {
        await apiUpdateCategory(editingId, payload)
      } else {
        await apiCreateCategory(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await apiDeleteCategory(deleteId)
      setDeleteId(null)
      await load()
    } catch {
      setError('Erro ao excluir')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  // Stats
  const projectCount = allCategories.filter((c) => getCategoryType(c) === 'project').length
  const stackCount = allCategories.filter((c) => getCategoryType(c) === 'stack').length
  const withColor = allCategories.filter((c) => !!c.color).length
  const withIcon = allCategories.filter((c) => !!c.icon).length

  // Table columns
  const tableColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'slug', label: 'Slug' },
    { key: 'color', label: 'Cor' },
    { key: 'order', label: 'Ordem' },
  ]

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle={`${allCategories.length} categoria${allCategories.length !== 1 ? 's' : ''} cadastrada${allCategories.length !== 1 ? 's' : ''}`}
        onAdd={openAdd}
        addLabel="Nova categoria"
        icon={<Tag size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">{error}</div>
      )}

      {/* Stats */}
      {allCategories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total" value={allCategories.length} icon={Tag}
            cornerColor="from-accent to-primary" iconBg="bg-accent/20" iconColor="text-accent" />
          <StatCard label="Projeto" value={projectCount} icon={FolderKanban}
            cornerColor="from-[#5e81ac] to-[#5e81ac]/60" iconBg="bg-[#5e81ac]/20" iconColor="text-[#5e81ac]" />
          <StatCard label="Stack" value={stackCount} icon={Layers}
            cornerColor="from-green to-green/60" iconBg="bg-green/20" iconColor="text-green" />
          <StatCard label="Com cor" value={withColor} icon={Palette}
            cornerColor="from-purple to-purple/60" iconBg="bg-purple/20" iconColor="text-purple" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-white/5 p-5 mb-4 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-20" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nome ou slug..."
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

        {/* Type chips */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Tipo</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => {
              const isActive = selectedType === t.key
              return (
                <button key={t.key} type="button"
                  onClick={() => { setSelectedType(isActive ? '' : t.key); setPage(1) }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border"
                  style={isActive
                    ? { backgroundColor: `${t.color}20`, color: t.color, borderColor: `${t.color}30` }
                    : { backgroundColor: 'transparent', color: '#a4a8af', borderColor: 'rgba(255,255,255,0.1)' }
                  }>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.label}
                </button>
              )
            })}
            {selectedType && (
              <button type="button" onClick={() => { setSelectedType(''); setPage(1) }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body text-grey-20 hover:text-white border border-white/5 hover:border-white/20 transition-all">
                <X size={11} /> Limpar
              </button>
            )}
          </div>
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
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-grey-20 cursor-pointer hover:text-white select-none transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon dir={sortBy === col.key ? sortDir : null} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-body font-semibold uppercase tracking-wider text-grey-20 w-24">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length + 2} className="px-4 py-12 text-center text-sm font-body text-grey-20">
                        Nenhuma categoria encontrada.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((cat) => {
                      const catType = getCategoryType(cat)
                      const typeColor = catType === 'stack' ? '#a3be8c' : '#5e81ac'
                      return (
                        <tr key={cat.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-sm font-body text-grey-30">{cat.name}</td>
                          <td className="px-4 py-3 text-sm font-body text-grey-20 font-mono">{cat.slug}</td>
                          <td className="px-4 py-3 text-sm font-body">
                            {cat.color ? (
                              <div className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: cat.color }} />
                                <span className="text-xs font-mono text-grey-20">{cat.color}</span>
                              </div>
                            ) : <span className="text-grey-10">-</span>}
                          </td>
                          <td className="px-4 py-3 text-sm font-body text-grey-30">{cat.order}</td>
                          <td className="px-4 py-3 text-sm font-body">
                            <span className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full border"
                              style={{ backgroundColor: `${typeColor}15`, color: typeColor, borderColor: `${typeColor}30` }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor }} />
                              {catType === 'stack' ? 'Stack' : 'Projeto'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(cat)}
                                className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="Editar">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => setDeleteId(cat.id)}
                                className="p-1.5 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors" title="Excluir">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-white/5">
                <p className="text-xs font-body text-grey-20">
                  Exibindo {startItem}-{endItem} de {filtered.length} registros
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1}
                    className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors" title="Primeira">
                    <ChevronsLeft size={16} />
                  </button>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors" title="Anterior">
                    <ChevronLeft size={16} />
                  </button>
                  {pageNumbers.map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-body font-medium transition-colors ${
                        n === page ? 'bg-primary text-white' : 'text-grey-20 hover:text-white hover:bg-white/5'
                      }`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors" title="Proxima">
                    <ChevronRight size={16} />
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors" title="Ultima">
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={editingId ? 'Editar categoria' : 'Nova categoria'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nome" value={form.name}
              onChange={(e) => set('name')(e.target.value)} required placeholder="Ex: Machine Learning" />
            <FormField label="Slug" value={form.slug}
              onChange={(e) => set('slug')(e.target.value)} placeholder="Auto-gerado se vazio"
              hint="Identificador unico (ex: machine-learning)" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-medium text-grey-30 mb-1.5">Cor</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color}
                    onChange={(e) => set('color')(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                  <input type="text" value={form.color}
                    onChange={(e) => set('color')(e.target.value)}
                    className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-primary outline-none" />
                </div>
              </div>
              <FormField label="Ordem" type="number" value={form.order}
                onChange={(e) => set('order')(e.target.value)} placeholder="0" />
            </div>
            <FormField label="Icone" value={form.icon}
              onChange={(e) => set('icon')(e.target.value)} placeholder="bx-brain"
              hint="Classe BoxIcons (bx-brain, bx-chip, etc)" />

            {error && <p className="text-red text-sm font-body">{error}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-body text-grey-30 hover:text-white hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-body font-semibold bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          message="Tem certeza que deseja excluir esta categoria? Os projetos vinculados perderão essa categoria."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
