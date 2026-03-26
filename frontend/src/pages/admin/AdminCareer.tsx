import { FC, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronsUpDown,
  Pencil,
  Search,
  Trash2,
  X,
  Globe,
  Layers,
  Calendar,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import type { CareerEntry, StackDetail } from '@/types'
import type { AdminCategory } from '@/services/api'
import {
  fetchFilteredCareer,
  createCareerEntry,
  updateCareerEntry,
  deleteCareerEntry,
  fetchAdminStacks,
  fetchAdminDomains,
} from '@/services/api'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { FormField } from './components/FormField'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortDir = 'asc' | 'desc' | null

type CareerDomain = AdminCategory

type CareerForm = {
  company: string
  role: string
  contractType: string
  startDate: string
  endDate: string
  summary: string
  projectTypes: string
  actions: string
  order: string
  stackIds: string[]
  domainIds: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STACK_CATEGORY_COLORS: Record<string, string> = {
  'Linguagens': '#a3be8c',
  'Frameworks Backend': '#5e81ac',
  'Databases': '#88c0d0',
  'Mensageria / Filas': '#d08770',
  'Cloud / Infra': '#bf616a',
  'IA / Machine Learning': '#b48ead',
  'Frontend': '#81a1c1',
  'Testes / Qualidade': '#ebcb8b',
  'Arquitetura / Padrões': '#8fbcbb',
}

const CONTRACT_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  CLT: { bg: '#5e81ac20', text: '#5e81ac', border: '#5e81ac30' },
  PJ: { bg: '#b48ead20', text: '#b48ead', border: '#b48ead30' },
  Freelancer: { bg: '#d0877020', text: '#d08770', border: '#d0877030' },
}

const PAGE_SIZE = 10

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (iso: string): string => {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]}/${d.getFullYear()}`
}

const fmtPeriod = (start: string, end: string | null): string =>
  `${fmtDate(start)} - ${end ? fmtDate(end) : 'Atual'}`

const calcDuration = (start: string, end: string | null): string => {
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  let m = (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth()
  if (m < 1) m = 1
  const y = Math.floor(m / 12)
  const r = m % 12
  if (y === 0) return `${r}m`
  if (r === 0) return `${y}a`
  return `${y}a ${r}m`
}

const emptyForm = (): CareerForm => ({
  company: '',
  role: '',
  contractType: 'CLT',
  startDate: '',
  endDate: '',
  summary: '',
  projectTypes: '',
  actions: '',
  order: '0',
  stackIds: [],
  domainIds: [],
})

const entryToForm = (e: CareerEntry & { order?: number }): CareerForm => ({
  company: e.company,
  role: e.role,
  contractType: e.contractType,
  startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '',
  endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '',
  summary: e.summary,
  projectTypes: e.projectTypes.join('\n'),
  actions: e.actions.join('\n'),
  order: String(e.order ?? 0),
  stackIds: (e.stacks ?? []).map((s) => s.stackDetail.id),
  domainIds: (e.domains ?? []).map((d) => d.domain.id),
})

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Chip({ label, color, active, onClick }: { label: string; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all ${
        active ? 'bg-primary text-white border border-primary' : 'bg-transparent text-grey-30 border border-white/10 hover:border-white/30 hover:text-white'
      }`}
    >
      {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
      {label}
    </button>
  )
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ChevronUp size={14} className="text-accent" />
  if (dir === 'desc') return <ChevronDown size={14} className="text-accent" />
  return <ChevronsUpDown size={14} className="text-grey-20 opacity-50" />
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AdminCareer: FC = () => {
  // Server data
  const [allEntries, setAllEntries] = useState<(CareerEntry & { order?: number })[]>([])
  const [entries, setEntries] = useState<(CareerEntry & { order?: number })[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [filterContract, setFilterContract] = useState<string | null>(null)
  const [filterNoStacks, setFilterNoStacks] = useState(false)
  const [filterNoDomains, setFilterNoDomains] = useState(false)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Reference data
  const [availableStacks, setAvailableStacks] = useState<StackDetail[]>([])
  const [availableDomains, setAvailableDomains] = useState<CareerDomain[]>([])

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CareerForm>(emptyForm())
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

  // Load entries whenever filter/sort/page changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchFilteredCareer({
        search: debouncedSearch || undefined,
        domains: selectedDomains.length ? selectedDomains.join(',') : undefined,
        contractType: filterContract || undefined,
        noStacks: filterNoStacks || undefined,
        noDomains: filterNoDomains || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir: sortDir ?? undefined,
      })
      setEntries(result.data as (CareerEntry & { order?: number })[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError('Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedDomains, filterContract, filterNoStacks, filterNoDomains, page, sortBy, sortDir])

  // Load reference data
  useEffect(() => {
    void fetchAdminStacks().then(setAvailableStacks).catch(() => undefined)
    void fetchAdminDomains().then(setAvailableDomains).catch(() => undefined)
  }, [])

  // Load all entries for stats (once)
  useEffect(() => {
    void fetchFilteredCareer({ pageSize: 100 }).then((r) => setAllEntries(r.data as (CareerEntry & { order?: number })[])).catch(() => undefined)
  }, [])

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

  const openEdit = (e: CareerEntry & { order?: number }) => {
    setEditingId(e.id)
    setForm(entryToForm(e))
    setError(null)
    setModalOpen(true)
  }

  const setField = (field: keyof CareerForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  // Form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      company: form.company,
      role: form.role,
      contractType: form.contractType,
      startDate: form.startDate || undefined,
      endDate: form.endDate || null,
      summary: form.summary,
      projectTypes: form.projectTypes.split('\n').map((s) => s.trim()).filter(Boolean),
      actions: form.actions.split('\n').map((s) => s.trim()).filter(Boolean),
      order: parseInt(form.order, 10) || 0,
      stackIds: form.stackIds.length ? form.stackIds : undefined,
      domainIds: form.domainIds.length ? form.domainIds : undefined,
    }

    try {
      if (editingId) {
        await updateCareerEntry(editingId, payload)
      } else {
        await createCareerEntry(payload)
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
      await deleteCareerEntry(deleteId)
      setDeleteId(null)
      await load()
    } catch {
      setError('Erro ao excluir entrada')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Stats derived values
  // ---------------------------------------------------------------------------

  const uniqueDomainsCount = useMemo(() => {
    const ids = new Set<string>()
    for (const e of allEntries) {
      for (const d of (e.domains ?? [])) ids.add(d.domain.id)
    }
    return ids.size
  }, [allEntries])

  const totalStacksCount = useMemo(
    () => allEntries.reduce((sum, e) => sum + (e.stacks ?? []).length, 0),
    [allEntries],
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tableColumns: { key: string; label: string; className?: string }[] = [
    { key: 'company', label: 'Empresa' },
    { key: 'role', label: 'Cargo' },
    { key: 'contractType', label: 'Contrato' },
    { key: 'startDate', label: 'Início' },
    { key: 'domains', label: 'Domínios' },
  ]

  return (
    <div>
      <PageHeader
        title="Histórico Profissional"
        subtitle={`${total} entrada${total !== 1 ? 's' : ''}`}
        onAdd={openAdd}
        addLabel="Nova entrada"
        icon={<Briefcase size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">
          {error}
        </div>
      )}

      {/* Stats */}
      {allEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="Experiências" value={allEntries.length} icon={Briefcase}
            cornerColor="from-accent to-primary" iconBg="bg-accent/20" iconColor="text-accent" />
          <StatCard label="Domínios" value={uniqueDomainsCount} icon={Globe}
            cornerColor="from-green to-green/60" iconBg="bg-green/20" iconColor="text-green" />
          <StatCard label="Com stacks" value={allEntries.filter((e) => (e.stacks ?? []).length > 0).length} icon={Layers}
            cornerColor="from-purple to-purple/60" iconBg="bg-purple/20" iconColor="text-purple" />
          <StatCard label="Total de stacks" value={totalStacksCount} icon={Calendar}
            cornerColor="from-yellow to-yellow/60" iconBg="bg-yellow/20" iconColor="text-yellow" />
        </div>
      )}

      {/* Filter block */}
      <div className="bg-surface rounded-xl border border-white/5 p-5 mb-4 space-y-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-20" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por empresa, cargo..."
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

        {/* Domain filter chips */}
        {availableDomains.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Domínios</p>
            <div className="flex flex-wrap gap-2">
              {availableDomains.map((d) => (
                <Chip
                  key={d.slug}
                  label={d.name}
                  color={d.color}
                  active={selectedDomains.includes(d.slug)}
                  onClick={() => {
                    setSelectedDomains((prev) => prev.includes(d.slug) ? prev.filter((x) => x !== d.slug) : [...prev, d.slug])
                    setPage(1)
                  }}
                />
              ))}
              {selectedDomains.length > 0 && (
                <button type="button" onClick={() => { setSelectedDomains([]); setPage(1) }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body text-grey-20 hover:text-white border border-white/5 hover:border-white/20 transition-all">
                  <X size={11} /> Limpar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contract type filter */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Tipo de Contrato</p>
          <div className="flex flex-wrap gap-2">
            {([
              { label: 'CLT', color: '#5e81ac' },
              { label: 'PJ', color: '#b48ead' },
              { label: 'Freelancer', color: '#d08770' },
            ] as const).map((ct) => (
              <button key={ct.label} type="button"
                onClick={() => { setFilterContract(filterContract === ct.label ? null : ct.label); setPage(1) }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border"
                style={filterContract === ct.label
                  ? { backgroundColor: `${ct.color}20`, color: ct.color, borderColor: `${ct.color}30` }
                  : { backgroundColor: 'transparent', color: '#a4a8af', borderColor: 'rgba(255,255,255,0.1)' }
                }>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ct.color }} />
                {ct.label}
              </button>
            ))}
            {filterContract && (
              <button type="button" onClick={() => { setFilterContract(null); setPage(1) }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body text-grey-20 hover:text-white border border-white/5 hover:border-white/20 transition-all">
                <X size={11} /> Limpar
              </button>
            )}
          </div>
        </div>

        {/* Quality filters */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Filtros de Qualidade</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setFilterNoStacks((v) => !v); setPage(1) }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border"
              style={filterNoStacks
                ? { backgroundColor: '#bf616a20', color: '#bf616a', borderColor: '#bf616a30' }
                : { backgroundColor: 'transparent', color: '#a4a8af', borderColor: 'rgba(255,255,255,0.1)' }
              }>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#bf616a' }} />
              Sem Stacks
            </button>
            <button type="button" onClick={() => { setFilterNoDomains((v) => !v); setPage(1) }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border"
              style={filterNoDomains
                ? { backgroundColor: '#ebcb8b20', color: '#ebcb8b', borderColor: '#ebcb8b30' }
                : { backgroundColor: 'transparent', color: '#a4a8af', borderColor: 'rgba(255,255,255,0.1)' }
              }>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ebcb8b' }} />
              Sem Domínios
            </button>
            {(filterNoStacks || filterNoDomains) && (
              <button type="button" onClick={() => { setFilterNoStacks(false); setFilterNoDomains(false); setPage(1) }}
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
                  {entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableColumns.length + 1}
                        className="px-4 py-12 text-center text-sm font-body text-grey-20"
                      >
                        Nenhuma entrada cadastrada.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => {
                      const ctStyle = CONTRACT_TYPE_STYLES[entry.contractType] ?? CONTRACT_TYPE_STYLES['CLT']
                      return (
                        <tr
                          key={entry.id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-body text-grey-30">
                            {entry.company}
                          </td>
                          <td className="px-4 py-3 text-sm font-body text-grey-30">
                            {entry.role}
                          </td>
                          <td className="px-4 py-3 text-sm font-body">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium border"
                              style={{ backgroundColor: ctStyle.bg, color: ctStyle.text, borderColor: ctStyle.border }}
                            >
                              {entry.contractType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-body text-grey-30 whitespace-nowrap">
                            {entry.startDate ? (
                              <span title={fmtPeriod(entry.startDate, entry.endDate)}>
                                {fmtDate(entry.startDate)}
                                <span className="ml-1 text-grey-20 text-xs">
                                  ({calcDuration(entry.startDate, entry.endDate)})
                                </span>
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-body">
                            <div className="flex flex-wrap gap-1">
                              {(entry.domains ?? []).length > 0
                                ? (entry.domains ?? []).map((di) => (
                                    <span
                                      key={di.domain.id}
                                      className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full border border-white/10"
                                      style={{
                                        backgroundColor: `${di.domain.color || '#5e81ac'}20`,
                                        color: di.domain.color || '#5e81ac',
                                      }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: di.domain.color || '#5e81ac' }} />
                                      {di.domain.name}
                                    </span>
                                  ))
                                : <span className="text-xs text-grey-20">Sem domínio</span>
                              }
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(entry)}
                                className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                                title="Editar"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => setDeleteId(entry.id)}
                                className="p-1.5 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors"
                                title="Excluir"
                              >
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
          title={editingId ? 'Editar entrada' : 'Nova entrada'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Empresa"
                value={form.company}
                onChange={(e) => setField('company')(e.target.value)}
                required
                placeholder="Nome da empresa"
              />
              <div>
                <label className="block text-sm font-body font-medium text-grey-30 mb-1.5">
                  Tipo de Contrato
                </label>
                <select
                  value={form.contractType}
                  onChange={(e) => setField('contractType')(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-sm font-body text-white focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Cargo"
                value={form.role}
                onChange={(e) => setField('role')(e.target.value)}
                required
                placeholder="Ex: Backend Developer"
              />
              <FormField
                label="Ordem"
                type="number"
                value={form.order}
                onChange={(e) => setField('order')(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Data de Início"
                type="date"
                value={form.startDate}
                onChange={(e) => setField('startDate')(e.target.value)}
                required
              />
              <FormField
                label="Data de Término (vazio = atual)"
                type="date"
                value={form.endDate}
                onChange={(e) => setField('endDate')(e.target.value)}
              />
            </div>

            <FormField
              as="textarea"
              label="Resumo"
              value={form.summary}
              onChange={(e) => setField('summary')(e.target.value)}
              rows={3}
              placeholder="Descrição geral da experiência"
            />

            <FormField
              as="textarea"
              label="Tipos de projeto"
              value={form.projectTypes}
              onChange={(e) => setField('projectTypes')(e.target.value)}
              rows={3}
              placeholder="Um tipo por linha"
              hint="Um item por linha"
            />

            <FormField
              as="textarea"
              label="Ações realizadas"
              value={form.actions}
              onChange={(e) => setField('actions')(e.target.value)}
              rows={4}
              placeholder="Uma ação por linha"
              hint="Um item por linha"
            />

            {/* Domains multi-select */}
            {availableDomains.length > 0 && (
              <div>
                <label className="block text-sm font-body font-medium text-grey-30 mb-2">
                  Domínios
                  {form.domainIds.length > 0 && (
                    <span className="ml-2 text-xs text-accent">({form.domainIds.length} selecionado{form.domainIds.length > 1 ? 's' : ''})</span>
                  )}
                </label>
                <div className="bg-background/50 border border-white/5 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    {availableDomains.map((domain) => {
                      const isSelected = form.domainIds.includes(domain.id)
                      const color = domain.color || '#5e81ac'
                      return (
                        <button
                          key={domain.id}
                          type="button"
                          onClick={() => setForm((prev) => ({
                            ...prev,
                            domainIds: prev.domainIds.includes(domain.id)
                              ? prev.domainIds.filter((id) => id !== domain.id)
                              : [...prev.domainIds, domain.id],
                          }))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all border ${
                            isSelected
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-white/10 bg-transparent text-grey-20 hover:border-white/30'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          {domain.name}
                          {isSelected && <X size={12} className="ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Stacks vinculadas (multi-select) */}
            {availableStacks.length > 0 && (
              <div>
                <label className="block text-sm font-body font-medium text-grey-30 mb-2">
                  Stacks Vinculadas
                  {form.stackIds.length > 0 && (
                    <span className="ml-2 text-xs text-accent">({form.stackIds.length} selecionada{form.stackIds.length > 1 ? 's' : ''})</span>
                  )}
                </label>
                <div className="bg-background/50 border border-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {availableStacks.map((stack) => {
                      const isSelected = form.stackIds.includes(stack.id)
                      const color = stack.category?.color || '#5e81ac'
                      return (
                        <button
                          key={stack.id}
                          type="button"
                          onClick={() => setForm((prev) => ({
                            ...prev,
                            stackIds: prev.stackIds.includes(stack.id)
                              ? prev.stackIds.filter((id) => id !== stack.id)
                              : [...prev.stackIds, stack.id],
                          }))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all border ${
                            isSelected
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-white/10 bg-transparent text-grey-20 hover:border-white/30'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          {stack.name}
                          {isSelected && <X size={12} className="ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

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
          message="Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
