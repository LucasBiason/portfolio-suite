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
  Database,
  Wrench,
  Code,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import type { StackDetail } from '@/types'
import {
  fetchFilteredStacks,
  createStack,
  updateStack,
  deleteStack,
} from '@/services/api'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { FormField } from './components/FormField'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortDir = 'asc' | 'desc' | null

type StackForm = {
  name: string
  categoryId: string
  startYear: string
  endYear: string
  level: string
  icon: string
  profProjects: string
  personalProjects: string
  solutions: string
  patterns: string
  order: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10

const LEVELS = ['Especialista', 'Avançado', 'Intermediário', 'Básico'] as const

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Especialista': { bg: '#a3be8c20', text: '#a3be8c', border: '#a3be8c30' },
  'Avançado': { bg: '#5e81ac20', text: '#5e81ac', border: '#5e81ac30' },
  'Intermediário': { bg: '#88c0d020', text: '#88c0d0', border: '#88c0d030' },
  'Básico': { bg: '#ebcb8b20', text: '#ebcb8b', border: '#ebcb8b30' },
  // Legacy
  'Expert': { bg: '#a3be8c20', text: '#a3be8c', border: '#a3be8c30' },
  'Intermediário-Avançado': { bg: '#81a1c120', text: '#81a1c1', border: '#81a1c130' },
  'Basico-Inter': { bg: '#d0877020', text: '#d08770', border: '#d0877030' },
}

// Category colors now come from the API (Category.color field)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const currentYear = new Date().getFullYear()

const emptyForm = (): StackForm => ({
  name: '',
  categoryId: '',
  startYear: String(currentYear),
  endYear: '',
  level: '',
  icon: '',
  profProjects: '',
  personalProjects: '',
  solutions: '',
  patterns: '',
  order: '0',
})

const stackToForm = (s: StackDetail): StackForm => ({
  name: s.name,
  categoryId: s.categoryId,
  startYear: String(s.startYear),
  endYear: s.endYear != null ? String(s.endYear) : '',
  level: s.level,
  icon: s.icon ?? '',
  profProjects: s.profProjects.join('\n'),
  personalProjects: s.personalProjects.join('\n'),
  solutions: s.solutions.join('\n'),
  patterns: s.patterns.join('\n'),
  order: String(s.order ?? 0),
})

function formatYears(startYear: number, endYear: number | null): string {
  const end = endYear ?? currentYear
  const diff = end - startYear
  if (diff < 1) return `${startYear} (< 1 ano)`
  return `${startYear} - ${endYear ? endYear : 'Atual'} (${diff}+ ano${diff > 1 ? 's' : ''})`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ChevronUp size={14} className="text-accent" />
  if (dir === 'desc') return <ChevronDown size={14} className="text-accent" />
  return <ChevronsUpDown size={14} className="text-grey-20 opacity-50" />
}

type ChipProps = {
  label: string
  active: boolean
  onClick: () => void
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all
        ${active
          ? 'bg-primary text-white border border-primary'
          : 'bg-transparent text-grey-30 border border-white/10 hover:border-white/30 hover:text-white'
        }
      `}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AdminStacks: FC = () => {
  // Server data
  const [stacks, setStacks] = useState<StackDetail[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Available categories (derived from all stacks fetched without filters)
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string; color?: string }[]>([])

  // All stacks (unfiltered) for stats
  const [allStacks, setAllStacks] = useState<StackDetail[]>([])

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<StackForm>(emptyForm())
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

  // Load unique categories and all stacks once for filter chips and stats
  useEffect(() => {
    void fetchFilteredStacks({ pageSize: 500 }).then((r) => {
      const data = r.data as StackDetail[]
      const catMap = new Map<string, { id: string; name: string; color?: string }>()
      for (const s of data) {
        if (s.category && !catMap.has(s.category.id)) {
          catMap.set(s.category.id, { id: s.category.id, name: s.category.name, color: s.category.color })
        }
      }
      setAvailableCategories(Array.from(catMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
      setAllStacks(data)
    }).catch(() => undefined)
  }, [])

  // Load stacks whenever filter/sort/page changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchFilteredStacks({
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir: sortDir ?? undefined,
      })
      setStacks(result.data as StackDetail[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError('Erro ao carregar stacks')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedCategory, selectedLevel, page, sortBy, sortDir])

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

  const openEdit = (s: StackDetail) => {
    setEditingId(s.id)
    setForm(stackToForm(s))
    setError(null)
    setModalOpen(true)
  }

  const set = (field: keyof StackForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  // Form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const splitLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)

    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      startYear: parseInt(form.startYear, 10),
      endYear: form.endYear ? parseInt(form.endYear, 10) : null,
      level: form.level,
      icon: form.icon || undefined,
      profProjects: splitLines(form.profProjects),
      personalProjects: splitLines(form.personalProjects),
      solutions: splitLines(form.solutions),
      patterns: splitLines(form.patterns),
      order: parseInt(form.order, 10) || 0,
    }

    try {
      if (editingId) {
        await updateStack(editingId, payload)
      } else {
        await createStack(payload)
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
      await deleteStack(deleteId)
      setDeleteId(null)
      await load()
    } catch {
      setError('Erro ao excluir stack')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tableColumns: { key: string; label: string; className?: string }[] = [
    { key: 'name', label: 'Nome' },
    { key: 'category', label: 'Categoria' },
    { key: 'startYear', label: 'Experiência' },
    { key: 'level', label: 'Nível' },
  ]

  return (
    <div>
      <PageHeader
        title="Stacks"
        subtitle={`${total} tecnologia${total !== 1 ? 's' : ''} cadastrada${total !== 1 ? 's' : ''}`}
        onAdd={openAdd}
        addLabel="Nova stack"
        icon={<Layers size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">
          {error}
        </div>
      )}

      {/* Stats */}
      {allStacks.length > 0 && (() => {
        const expertCount = allStacks.filter((s) => s.level === 'Especialista').length
        const advancedCount = allStacks.filter((s) => s.level === 'Avançado').length
        const years = allStacks.map((s) => (s.endYear ?? currentYear) - s.startYear)
        const maxYears = Math.max(...years, 0)
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total de stacks" value={allStacks.length} icon={Layers}
              cornerColor="from-accent to-primary" iconBg="bg-accent/20" iconColor="text-accent" />
            <StatCard label="Especialistas" value={expertCount} icon={Code}
              cornerColor="from-green to-green/60" iconBg="bg-green/20" iconColor="text-green" />
            <StatCard label="Avançados" value={advancedCount} icon={Wrench}
              cornerColor="from-purple to-purple/60" iconBg="bg-purple/20" iconColor="text-purple" />
            <StatCard label="Máx. anos" value={`${maxYears}+`} icon={Database}
              cornerColor="from-yellow to-yellow/60" iconBg="bg-yellow/20" iconColor="text-yellow" />
          </div>
        )
      })()}

      {/* Filter block */}
      <div className="bg-surface rounded-xl border border-white/5 p-5 mb-4 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-20" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nome ou categoria..."
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

        {/* Category chips */}
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">
              Categoria
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const catColor = cat.color || '#5e81ac'
                const isActive = selectedCategory === cat.id
                return (
                  <button key={cat.id} type="button"
                    onClick={() => { setSelectedCategory(isActive ? '' : cat.id); setPage(1) }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border"
                    style={isActive
                      ? { backgroundColor: `${catColor}20`, color: catColor, borderColor: `${catColor}30` }
                      : { backgroundColor: 'transparent', color: '#a4a8af', borderColor: 'rgba(255,255,255,0.1)' }
                    }>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
                    {cat.name}
                  </button>
                )
              })}
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => { setSelectedCategory(''); setPage(1) }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body text-grey-20 hover:text-white border border-white/5 hover:border-white/20 transition-all"
                >
                  <X size={11} />
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Level filter */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Nível</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lvl) => {
              const lc = LEVEL_COLORS[lvl]
              return (
                <button key={lvl} type="button" onClick={() => { setSelectedLevel(selectedLevel === lvl ? '' : lvl); setPage(1) }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-all border"
                  style={selectedLevel === lvl
                    ? { backgroundColor: lc.bg, color: lc.text, borderColor: lc.border }
                    : { backgroundColor: 'transparent', color: '#a4a8af', borderColor: 'rgba(255,255,255,0.1)' }
                  }>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lc.text }} />
                  {lvl}
                </button>
              )
            })}
            {selectedLevel && (
              <button type="button" onClick={() => { setSelectedLevel(''); setPage(1) }}
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
                  {stacks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableColumns.length + 1}
                        className="px-4 py-12 text-center text-sm font-body text-grey-20"
                      >
                        Nenhuma stack cadastrada.
                      </td>
                    </tr>
                  ) : (
                    stacks.map((stack) => (
                      <tr
                        key={stack.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {stack.name}
                        </td>
                        <td className="px-4 py-3 text-sm font-body">
                          {(() => {
                            const catColor = stack.category?.color || '#5e81ac'
                            return (
                              <span className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full border"
                                style={{ backgroundColor: `${catColor}15`, color: catColor, borderColor: `${catColor}30` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                                {stack.category?.name}
                              </span>
                            )
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {formatYears(stack.startYear, stack.endYear)}
                        </td>
                        <td className="px-4 py-3 text-sm font-body">
                          {(() => {
                            const lc = LEVEL_COLORS[stack.level]
                            return lc ? (
                              <span className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full border"
                                style={{ backgroundColor: lc.bg, color: lc.text, borderColor: lc.border }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lc.text }} />
                                {stack.level}
                              </span>
                            ) : <span className="text-grey-20 text-xs">{stack.level}</span>
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(stack)}
                              className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteId(stack.id)}
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

      {/* Escala de Níveis */}
      <div className="mt-6 bg-surface rounded-xl border border-white/5 p-6">
        <h3 className="font-header text-base font-semibold text-white mb-4">Escala de Classificação de Nível</h3>
        <p className="font-body text-sm text-grey-20 mb-4">
          A classificação de nível de cada tecnologia é baseada em uma combinação de tempo de experiência,
          complexidade dos projetos realizados e profundidade de conhecimento aplicado em produção.
        </p>
        <div className="space-y-3">
          {[
            {
              level: 'Especialista', time: '8+ anos', color: LEVEL_COLORS['Especialista'],
              desc: 'Domínio profundo da tecnologia com capacidade de tomar decisões arquiteturais críticas. Experiência comprovada em sistemas de alta escala em produção. Capaz de mentorar outros desenvolvedores e resolver problemas complexos de forma autônoma.',
            },
            {
              level: 'Avançado', time: '4-8 anos', color: LEVEL_COLORS['Avançado'],
              desc: 'Experiência sólida em projetos complexos em produção. Aplica padrões de design avançados e boas práticas. Resolve problemas de forma autônoma e contribui para decisões técnicas do time.',
            },
            {
              level: 'Intermediário', time: '1-4 anos', color: LEVEL_COLORS['Intermediário'],
              desc: 'Conhecimento funcional com projetos em produção. Aplica boas práticas e tem autonomia parcial. Trabalha bem em equipe e busca evolução constante.',
            },
            {
              level: 'Básico', time: '< 1 ano', color: LEVEL_COLORS['Básico'],
              desc: 'Conhecimento inicial com projetos pessoais ou de estudo. Compreende os fundamentos e está em fase de aprendizado ativo. Necessita orientação em cenários complexos.',
            },
          ].map((item) => (
            <div key={item.level} className="flex gap-3 items-start p-3 rounded-lg bg-background/50 border border-white/5">
              <div className="flex-shrink-0 mt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold border"
                  style={{ backgroundColor: item.color.bg, color: item.color.text, borderColor: item.color.border }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color.text }} />
                  {item.level}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-body text-xs font-semibold text-grey-30 mb-1">Tempo de referência: {item.time}</p>
                <p className="font-body text-xs text-grey-20 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 font-body text-xs text-grey-10 italic">
          Nota: O tempo é uma referência, não um critério absoluto. A classificação considera também
          a complexidade dos projetos (microsserviços vs CRUD simples), uso em produção real,
          aplicação de padrões avançados e domínio sobre diferentes aspectos da tecnologia.
        </p>
      </div>

      {/* Edit / Add modal */}
      {modalOpen && (
        <Modal
          title={editingId ? 'Editar stack' : 'Nova stack'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Nome"
                value={form.name}
                onChange={(e) => set('name')(e.target.value)}
                required
                placeholder="Ex: React"
              />
              <div>
                <label className="block text-sm font-body text-grey-30 mb-1">Categoria</label>
                <select value={form.categoryId} onChange={(e) => set('categoryId')(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none">
                  <option value="">Selecione...</option>
                  {availableCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField
                label="Ano Inicio"
                type="number"
                value={form.startYear}
                onChange={(e) => set('startYear')(e.target.value)}
                required
                placeholder="2020"
              />
              <FormField
                label="Ano Fim"
                type="number"
                value={form.endYear}
                onChange={(e) => set('endYear')(e.target.value)}
                placeholder="Vazio = Atual"
              />
              <div>
                <label className="block text-sm font-body text-grey-30 mb-1">Nivel</label>
                <select value={form.level} onChange={(e) => set('level')(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none">
                  <option value="">Selecione...</option>
                  {LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <FormField
                label="Ordem"
                type="number"
                value={form.order}
                onChange={(e) => set('order')(e.target.value)}
                placeholder="0"
              />
            </div>

            <FormField
              label="Ícone"
              value={form.icon}
              onChange={(e) => set('icon')(e.target.value)}
              placeholder="Ex: react, python, docker"
              hint="Nome do icone Devicon (devicon.dev) - ex: python, react, docker, postgresql"
            />

            <FormField
              as="textarea"
              label="Projetos profissionais"
              value={form.profProjects}
              onChange={(e) => set('profProjects')(e.target.value)}
              rows={3}
              placeholder="Um projeto por linha"
              hint="Um item por linha"
            />

            <FormField
              as="textarea"
              label="Projetos pessoais"
              value={form.personalProjects}
              onChange={(e) => set('personalProjects')(e.target.value)}
              rows={3}
              placeholder="Um projeto por linha"
              hint="Um item por linha"
            />

            <FormField
              as="textarea"
              label="Soluções"
              value={form.solutions}
              onChange={(e) => set('solutions')(e.target.value)}
              rows={3}
              placeholder="Uma solução por linha"
              hint="Um item por linha"
            />

            <FormField
              as="textarea"
              label="Padrões"
              value={form.patterns}
              onChange={(e) => set('patterns')(e.target.value)}
              rows={3}
              placeholder="Um padrão por linha"
              hint="Um item por linha"
            />

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
          message="Tem certeza que deseja excluir esta stack? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
