import { FC, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronsUpDown,
  Globe,
  Palette,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { FormField } from './components/FormField'
import { ConfirmDialog } from './components/ConfirmDialog'
import { fetchAdminDomains, getAuthToken } from '@/services/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Domain = {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  order: number
}

type DomainForm = {
  name: string
  slug: string
  icon: string
  color: string
  order: string
}

type SortDir = 'asc' | 'desc' | null

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getApiBase = () => {
  if (typeof window === 'undefined') return ''
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    return import.meta.env.VITE_API_URL || 'http://localhost:3001'
  return window.location.origin
}

const authH = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
})

const emptyForm = (): DomainForm => ({
  name: '',
  slug: '',
  icon: '',
  color: '#5e81ac',
  order: '0',
})

const toForm = (d: Domain): DomainForm => ({
  name: d.name,
  slug: d.slug,
  icon: d.icon ?? '',
  color: d.color ?? '#5e81ac',
  order: String(d.order),
})

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ChevronUp size={14} className="text-accent" />
  if (dir === 'desc') return <ChevronDown size={14} className="text-accent" />
  return <ChevronsUpDown size={14} className="text-grey-20 opacity-50" />
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AdminDomains: FC = () => {
  const [allDomains, setAllDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Modal / form
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DomainForm>(emptyForm())
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
      setAllDomains(await fetchAdminDomains() as Domain[])
    } catch {
      setError('Erro ao carregar dominios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  // Filtered + sorted data (client-side, small dataset)
  const filtered = useMemo(() => {
    let data = allDomains

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase()
      data = data.filter((d) =>
        d.name.toLowerCase().includes(term) || d.slug.toLowerCase().includes(term)
      )
    }

    if (sortBy && sortDir) {
      data = [...data].sort((a, b) => {
        const aVal = a[sortBy as keyof Domain]
        const bVal = b[sortBy as keyof Domain]
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
  }, [allDomains, debouncedSearch, sortBy, sortDir])

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

  const openEdit = (d: Domain) => {
    setEditingId(d.id)
    setForm(toForm(d))
    setError(null)
    setModalOpen(true)
  }

  const set = (field: keyof DomainForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await fetch(`${getApiBase()}/api/domains${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: authH(),
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || undefined,
          icon: form.icon || undefined,
          color: form.color || undefined,
          order: parseInt(form.order, 10) || 0,
        }),
      })
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
      await fetch(`${getApiBase()}/api/domains/${deleteId}`, {
        method: 'DELETE',
        headers: authH(),
      })
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
  const withColor = allDomains.filter((d) => !!d.color).length
  const withIcon = allDomains.filter((d) => !!d.icon).length

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
        title="Dominios"
        subtitle={`${allDomains.length} ${allDomains.length !== 1 ? 'dominios cadastrados' : 'dominio cadastrado'}`}
        onAdd={openAdd}
        addLabel="Novo dominio"
        icon={<Globe size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">{error}</div>
      )}

      {/* Stats */}
      {allDomains.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <StatCard label="Total" value={allDomains.length} icon={Globe}
            cornerColor="from-accent to-primary" iconBg="bg-accent/20" iconColor="text-accent" />
          <StatCard label="Com cor" value={withColor} icon={Palette}
            cornerColor="from-green to-green/60" iconBg="bg-green/20" iconColor="text-green" />
          <StatCard label="Com icone" value={withIcon} icon={Globe}
            cornerColor="from-purple to-purple/60" iconBg="bg-purple/20" iconColor="text-purple" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-white/5 p-5 mb-4">
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
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Icone</th>
                    <th className="px-4 py-3 text-right text-xs font-body font-semibold uppercase tracking-wider text-grey-20 w-24">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length + 2} className="px-4 py-12 text-center text-sm font-body text-grey-20">
                        Nenhum dominio encontrado.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((domain) => (
                      <tr key={domain.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-sm font-body text-grey-30">{domain.name}</td>
                        <td className="px-4 py-3 text-sm font-body text-grey-20 font-mono">{domain.slug}</td>
                        <td className="px-4 py-3 text-sm font-body">
                          {domain.color ? (
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: domain.color }} />
                              <span className="text-xs font-mono text-grey-20">{domain.color}</span>
                            </div>
                          ) : <span className="text-grey-10">-</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-30">{domain.order}</td>
                        <td className="px-4 py-3 text-sm font-body">
                          {domain.icon ? (
                            <i className={`bx ${domain.icon} text-lg text-accent`} />
                          ) : <span className="text-grey-10">-</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(domain)}
                              className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="Editar">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleteId(domain.id)}
                              className="p-1.5 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors" title="Excluir">
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
          title={editingId ? 'Editar dominio' : 'Novo dominio'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nome" value={form.name}
              onChange={(e) => set('name')(e.target.value)} required placeholder="Ex: Turismo" />
            <FormField label="Slug" value={form.slug}
              onChange={(e) => set('slug')(e.target.value)} placeholder="Auto-gerado se vazio"
              hint="Identificador unico (ex: turismo)" />
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
              onChange={(e) => set('icon')(e.target.value)} placeholder="bx-globe"
              hint="Classe BoxIcons (bx-globe, bx-world, etc)" />

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
          message="Tem certeza que deseja excluir este dominio? Os projetos vinculados perderao esse dominio."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
