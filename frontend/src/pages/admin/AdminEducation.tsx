/**
 * @file AdminEducation.tsx
 * Admin page for managing academic education entries shown on the projects page.
 * Provides a filterable, sortable list with a modal form for creating and editing education records.
 */

import { FC, FormEvent, useCallback, useEffect, useRef, useState, useMemo } from 'react'
import {
  ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronUp, ChevronsUpDown, GraduationCap, Pencil, Search, Trash2, X,
  BookOpen, Clock,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import { getAuthToken } from '@/services/api'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { FormField } from './components/FormField'
import { ConfirmDialog } from './components/ConfirmDialog'

/** Represents an education record returned by the admin API. */
type Education = {
  id: string
  title: string
  institution: string
  period: string
  description: string | null
  status: string
  tags: string[]
  order: number
}

/** Controlled form state for creating or editing an education entry. */
type EducationForm = {
  title: string
  institution: string
  period: string
  description: string
  status: string
  tags: string
  order: string
}

/** Sort direction for the education table columns. */
type SortDir = 'asc' | 'desc' | null
const PAGE_SIZE = 10

/** Resolves the API base URL for direct fetch calls in this module. */
const getApiBase = () => {
  if (typeof window === 'undefined') return ''
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    return import.meta.env.VITE_API_URL || 'http://localhost:3001'
  return window.location.origin
}

/** Returns the authorisation headers required for admin API requests. */
const authHeaders = () => {
  const token = getAuthToken()
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

/** Renders the sort direction indicator icon for a table column header. */
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ChevronUp size={14} className="text-accent" />
  if (dir === 'desc') return <ChevronDown size={14} className="text-accent" />
  return <ChevronsUpDown size={14} className="text-grey-20 opacity-50" />
}

/** Returns a blank EducationForm initialised with sensible defaults. */
const emptyForm = (): EducationForm => ({
  title: '', institution: '', period: '', description: '', status: 'completed', tags: '', order: '0',
})

/** Maps an Education API object into the controlled form shape for editing. */
const toForm = (e: Education): EducationForm => ({
  title: e.title, institution: e.institution, period: e.period,
  description: e.description ?? '', status: e.status,
  tags: e.tags.join(', '), order: String(e.order),
})

/**
 * Renders the admin education management page.
 * Allows creating, editing and deleting academic education entries.
 * Used at the /admin/education route.
 */
export const AdminEducation: FC = () => {
  const [allItems, setAllItems] = useState<Education[]>([])
  const [items, setItems] = useState<Education[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EducationForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = (v: string) => {
    setSearch(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(v); setPage(1) }, 350)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/api/education`, { headers: authHeaders() })
      const data: Education[] = await res.json()
      setAllItems(data)
      let filtered = data
      if (filterStatus) {
        filtered = filtered.filter((e) => e.status === filterStatus)
      }
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase()
        filtered = filtered.filter((e) =>
          e.title.toLowerCase().includes(term) || e.institution.toLowerCase().includes(term) || e.period.toLowerCase().includes(term)
        )
      }
      if (sortBy && sortDir) {
        filtered.sort((a, b) => {
          const av = String((a as Record<string, unknown>)[sortBy] ?? '')
          const bv = String((b as Record<string, unknown>)[sortBy] ?? '')
          const cmp = av.localeCompare(bv, 'pt-BR')
          return sortDir === 'desc' ? -cmp : cmp
        })
      }
      setTotal(filtered.length)
      setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)))
      setItems(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
    } catch {
      setError('Erro ao carregar formações')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterStatus, page, sortBy, sortDir])

  useEffect(() => { void load() }, [load])

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    let start = Math.max(1, page - 2)
    const end = Math.min(totalPages, start + 4)
    start = Math.max(1, end - 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  const handleSort = (key: string) => {
    if (sortBy !== key) { setSortBy(key); setSortDir('asc') }
    else if (sortDir === 'asc') setSortDir('desc')
    else if (sortDir === 'desc') setSortDir(null)
    else setSortDir('asc')
    setPage(1)
  }

  const openAdd = () => { setEditingId(null); setForm(emptyForm()); setError(null); setModalOpen(true) }
  const openEdit = (e: Education) => { setEditingId(e.id); setForm(toForm(e)); setError(null); setModalOpen(true) }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setSaving(true); setError(null)
    const payload = {
      title: form.title, institution: form.institution, period: form.period,
      description: form.description || undefined, status: form.status,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      order: parseInt(form.order, 10) || 0,
    }
    try {
      await fetch(`${getApiBase()}/api/education${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload),
      })
      setModalOpen(false); await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`${getApiBase()}/api/education/${deleteId}`, { method: 'DELETE', headers: authHeaders() })
      setDeleteId(null); await load()
    } catch { setError('Erro ao excluir'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  const cols = [
    { key: 'title', label: 'Título' },
    { key: 'institution', label: 'Instituição' },
    { key: 'period', label: 'Período' },
    { key: 'status', label: 'Status' },
    { key: 'order', label: 'Ordem', className: 'text-center' },
  ]

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, total)

  return (
    <div>
      <PageHeader
        title="Formação Acadêmica"
        subtitle={`${total} ${total !== 1 ? 'formações cadastradas' : 'formação cadastrada'}`}
        onAdd={openAdd}
        addLabel="Nova formação"
        icon={<GraduationCap size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">{error}</div>
      )}

      {/* Stats */}
      {allItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <StatCard
            label="Total de formações"
            value={allItems.length}
            icon={GraduationCap}
            cornerColor="from-accent to-primary"
            iconBg="bg-accent/20"
            iconColor="text-accent"
          />
          <StatCard
            label="Em andamento"
            value={allItems.filter((e) => e.status === 'in_progress').length}
            icon={Clock}
            cornerColor="from-green to-green/60"
            iconBg="bg-green/20"
            iconColor="text-green"
          />
          <StatCard
            label="Concluídas"
            value={allItems.filter((e) => e.status === 'completed').length}
            icon={BookOpen}
            cornerColor="from-purple to-purple/60"
            iconBg="bg-purple/20"
            iconColor="text-purple"
          />
        </div>
      )}

      {/* Filter */}
      <div className="bg-surface rounded-xl border border-white/5 p-5 mb-4 space-y-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-20" />
          <input type="text" value={search} onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por título, instituição ou período..."
            className="w-full pl-9 pr-8 py-2 bg-background border border-white/10 rounded-lg text-sm font-body text-white placeholder:text-grey-20 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-grey-20 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Status</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setFilterStatus(filterStatus === 'in_progress' ? null : 'in_progress'); setPage(1) }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border ${
                filterStatus === 'in_progress' ? 'bg-green/20 text-green border-green/30' : 'bg-transparent text-grey-30 border-white/10 hover:border-white/30'
              }`}>
              <span className="w-2 h-2 rounded-full bg-green" />
              Em andamento
            </button>
            <button type="button" onClick={() => { setFilterStatus(filterStatus === 'completed' ? null : 'completed'); setPage(1) }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border ${
                filterStatus === 'completed' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-transparent text-grey-30 border-white/10 hover:border-white/30'
              }`}>
              <span className="w-2 h-2 rounded-full bg-accent" />
              Concluída
            </button>
            {filterStatus && (
              <button type="button" onClick={() => { setFilterStatus(null); setPage(1) }}
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
                    {cols.map((col) => (
                      <th key={col.key} onClick={() => handleSort(col.key)}
                        className={`px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-grey-20 cursor-pointer hover:text-white select-none transition-colors ${col.className ?? ''}`}>
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon dir={sortBy === col.key ? sortDir : null} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-body font-semibold uppercase tracking-wider text-grey-20 w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={cols.length + 1} className="px-4 py-12 text-center text-sm font-body text-grey-20">Nenhuma formação encontrada.</td></tr>
                  ) : items.map((edu) => (
                    <tr key={edu.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm font-body text-grey-30">{edu.title}</td>
                      <td className="px-4 py-3 text-sm font-body text-grey-30">{edu.institution}</td>
                      <td className="px-4 py-3 text-sm font-body text-grey-30">{edu.period}</td>
                      <td className="px-4 py-3 text-sm font-body">
                        {edu.status === 'in_progress'
                          ? <span className="px-2 py-0.5 rounded-full bg-green/20 text-green text-xs">Em andamento</span>
                          : <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs">Concluída</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm font-body text-grey-30 text-center">{edu.order}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(edu)} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="Editar"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteId(edu.id)} className="p-1.5 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors" title="Excluir"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-white/5">
                <p className="text-xs font-body text-grey-20">Exibindo {startItem}–{endItem} de {total} registros</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronsLeft size={16} /></button>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
                  {pageNumbers.map((n) => (
                    <button key={n} onClick={() => setPage(n)} className={`min-w-[32px] h-8 rounded-lg text-xs font-body font-medium transition-colors ${n === page ? 'bg-primary text-white' : 'text-grey-20 hover:text-white hover:bg-white/5'}`}>{n}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg text-grey-20 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronsRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal title={editingId ? 'Editar formação' : 'Nova formação'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Título" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="Ex: Pós-graduação em IA" />
            <FormField label="Instituição" value={form.institution} onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))} required placeholder="Ex: FIAP" />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Período" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} required placeholder="2009 - 2013 ou Em andamento" />
              <div>
                <label className="block text-sm font-body text-grey-30 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none">
                  <option value="completed">Concluída</option>
                  <option value="in_progress">Em andamento</option>
                </select>
              </div>
            </div>
            <FormField as="textarea" label="Descrição" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Descrição da formação" />
            <FormField label="Tags" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Machine Learning, NLP, IA" hint="Separar por vírgula" />
            <FormField label="Ordem" type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} placeholder="0" />
            {error && <p className="text-red text-sm font-body">{error}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-body text-grey-30 hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-body font-semibold bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog message="Tem certeza que deseja excluir esta formação? Esta ação não pode ser desfeita." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
      )}
    </div>
  )
}
