import { FC, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronsUpDown,
  FolderKanban,
  Pencil,
  Search,
  Trash2,
  X,
  Star,
  Github,
  Image,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import type { Project, ProjectCategory, StackDetail } from '@/types'
import type { AdminCategory } from '@/services/api'
import {
  fetchFilteredProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchAdminCategories,
  fetchAdminStacks,
} from '@/services/api'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { FormField } from './components/FormField'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImageEntry = { url: string; alt: string }

type SortDir = 'asc' | 'desc' | null

type ProjectForm = {
  title: string
  description: string
  longDescription: string
  technologies: string
  githubUrl: string
  demoUrl: string
  category: ProjectCategory
  categoryLabel: string
  featured: boolean
  order: string
  images: ImageEntry[]
  categoryIds: string[]
  stackIds: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEGACY_CATEGORIES: ProjectCategory[] = ['ml', 'api', 'fullstack', 'other']

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

const PAGE_SIZE = 10

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyForm = (): ProjectForm => ({
  title: '',
  description: '',
  longDescription: '',
  technologies: '',
  githubUrl: '',
  demoUrl: '',
  category: 'fullstack',
  categoryLabel: '',
  featured: false,
  order: '0',
  images: [],
  categoryIds: [],
  stackIds: [],
})

const projectToForm = (p: Project & { order?: number; categoryIds?: string[]; stackIds?: string[] }): ProjectForm => ({
  title: p.title,
  description: p.description,
  longDescription: p.longDescription ?? '',
  technologies: p.technologies.join(', '),
  githubUrl: p.githubUrl ?? '',
  demoUrl: p.demoUrl ?? '',
  category: p.category,
  categoryLabel: p.categoryLabel ?? '',
  featured: p.featured,
  order: String(p.order ?? 0),
  images: (p.images ?? []).map((img) => ({ url: img.url, alt: img.alt ?? '' })),
  categoryIds: (p.categories ?? []).map((pc) => pc.category.id),
  stackIds: (p.stacks ?? []).map((ps) => ps.stackDetail.id),
})

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
  color?: string
  active: boolean
  onClick: () => void
}

function Chip({ label, color, active, onClick }: ChipProps) {
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
      {color && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AdminProjects: FC = () => {
  // Server data
  const [projects, setProjects] = useState<(Project & { order?: number })[]>([])
  const [allProjects, setAllProjects] = useState<(Project & { order?: number })[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStacks, setSelectedStacks] = useState<string[]>([])
  const [filterNoGithub, setFilterNoGithub] = useState(false)
  const [filterNoImages, setFilterNoImages] = useState(false)
  const [filterNoStacks, setFilterNoStacks] = useState(false)
  const [filterNoCategories, setFilterNoCategories] = useState(false)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Reference data
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [stacks, setStacks] = useState<StackDetail[]>([])

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(emptyForm())
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

  // Load reference data + global stats once
  useEffect(() => {
    void fetchAdminCategories().then(setCategories).catch(() => undefined)
    void fetchAdminStacks().then(setStacks).catch(() => undefined)
    void fetchFilteredProjects({ pageSize: 100 }).then((r) => setAllProjects(r.data)).catch(() => undefined)
  }, [])

  // Load projects whenever filter/sort/page changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchFilteredProjects({
        search: debouncedSearch || undefined,
        categories: selectedCategories.length ? selectedCategories.join(',') : undefined,
        stacks: selectedStacks.length ? selectedStacks.join(',') : undefined,
        noGithub: filterNoGithub || undefined,
        noImages: filterNoImages || undefined,
        noStacks: filterNoStacks || undefined,
        noCategories: filterNoCategories || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir: sortDir ?? undefined,
      })
      setProjects(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError('Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedCategories, selectedStacks, filterNoGithub, filterNoImages, filterNoStacks, filterNoCategories, page, sortBy, sortDir])

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

  // Category filter toggle
  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
    setPage(1)
  }

  // Modal openers
  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (p: Project & { order?: number }) => {
    setEditingId(p.id)
    const full = projects.find((proj) => proj.id === p.id) ?? p
    setForm(projectToForm(full as Project & { order?: number; categoryIds?: string[]; stackIds?: string[] }))
    setError(null)
    setModalOpen(true)
  }

  // Form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title,
      description: form.description,
      longDescription: form.longDescription || undefined,
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      githubUrl: form.githubUrl || undefined,
      demoUrl: form.demoUrl || undefined,
      category: form.category,
      categoryLabel: form.categoryLabel || undefined,
      featured: form.featured,
      order: parseInt(form.order, 10) || 0,
      images: form.images.filter((img) => img.url.trim()).map((img, i) => ({
        url: img.url.trim(),
        alt: img.alt.trim() || undefined,
        order: i,
      })),
      categoryIds: form.categoryIds.length ? form.categoryIds : undefined,
      stackIds: form.stackIds.length ? form.stackIds : undefined,
    }

    try {
      if (editingId) {
        await updateProject(editingId, payload)
      } else {
        await createProject(payload)
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
      await deleteProject(deleteId)
      setDeleteId(null)
      await load()
    } catch {
      setError('Erro ao excluir projeto')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  // Form field setter
  const setField = (field: keyof ProjectForm) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleFormCategory = (id: string) =>
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }))

  const toggleFormStack = (id: string) =>
    setForm((prev) => ({
      ...prev,
      stackIds: prev.stackIds.includes(id)
        ? prev.stackIds.filter((s) => s !== id)
        : [...prev.stackIds, id],
    }))

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tableColumns: { key: string; label: string; numeric?: boolean; className?: string }[] = [
    { key: 'title', label: 'Título' },
    { key: 'categories', label: 'Categorias' },
    { key: 'stacks', label: 'Stacks' },
    { key: 'featured', label: 'Destaque' },
    { key: 'order', label: 'Ordem', numeric: true, className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader
        title="Projetos"
        subtitle={`${total} projeto${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
        onAdd={openAdd}
        addLabel="Novo projeto"
        icon={<FolderKanban size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">
          {error}
        </div>
      )}

      {/* Stats (always from allProjects, never affected by filters) */}
      {allProjects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard
            label="Total de projetos"
            value={allProjects.length}
            icon={FolderKanban}
            cornerColor="from-accent to-primary"
            iconBg="bg-accent/20"
            iconColor="text-accent"
          />
          <StatCard
            label="Em destaque"
            value={allProjects.filter((p) => p.featured).length}
            icon={Star}
            cornerColor="from-green to-green/60"
            iconBg="bg-green/20"
            iconColor="text-green"
          />
          <StatCard
            label="Com GitHub"
            value={allProjects.filter((p) => p.githubUrl).length}
            icon={Github}
            cornerColor="from-purple to-purple/60"
            iconBg="bg-purple/20"
            iconColor="text-purple"
          />
          <StatCard
            label="Com imagens"
            value={allProjects.filter((p) => (p.images?.length ?? 0) > 0).length}
            icon={Image}
            cornerColor="from-yellow to-yellow/60"
            iconBg="bg-yellow/20"
            iconColor="text-yellow"
          />
        </div>
      )}

      {/* Filter block */}
      <div className="bg-surface rounded-xl border border-white/5 p-5 mb-4 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-20" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por título..."
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
        {categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">
              Categorias
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Chip
                  key={cat.slug}
                  label={cat.name}
                  color={cat.color}
                  active={selectedCategories.includes(cat.slug)}
                  onClick={() => toggleCategory(cat.slug)}
                />
              ))}
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSelectedCategories([]); setPage(1) }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body text-grey-20 hover:text-white border border-white/5 hover:border-white/20 transition-all"
                >
                  <X size={11} />
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stack filter chips */}
        {stacks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">
              Stacks
            </p>
            <div className="flex flex-wrap gap-2">
              {stacks.map((stack) => (
                <Chip
                  key={stack.id}
                  label={stack.name}
                  color={stack.category?.color || '#5e81ac'}
                  active={selectedStacks.includes(stack.name)}
                  onClick={() => {
                    setSelectedStacks((prev) =>
                      prev.includes(stack.name) ? prev.filter((s) => s !== stack.name) : [...prev, stack.name]
                    )
                    setPage(1)
                  }}
                />
              ))}
              {selectedStacks.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSelectedStacks([]); setPage(1) }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body text-grey-20 hover:text-white border border-white/5 hover:border-white/20 transition-all"
                >
                  <X size={11} />
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quality filters */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">
            Filtros de Qualidade
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip
              label="Sem GitHub"
              color="#bf616a"
              active={filterNoGithub}
              onClick={() => { setFilterNoGithub((v) => !v); setPage(1) }}
            />
            <Chip
              label="Sem Imagens"
              color="#d08770"
              active={filterNoImages}
              onClick={() => { setFilterNoImages((v) => !v); setPage(1) }}
            />
            <Chip
              label="Sem Stacks"
              color="#b48ead"
              active={filterNoStacks}
              onClick={() => { setFilterNoStacks((v) => !v); setPage(1) }}
            />
            <Chip
              label="Sem Categorias"
              color="#ebcb8b"
              active={filterNoCategories}
              onClick={() => { setFilterNoCategories((v) => !v); setPage(1) }}
            />
            {(filterNoGithub || filterNoImages || filterNoStacks || filterNoCategories) && (
              <button
                type="button"
                onClick={() => { setFilterNoGithub(false); setFilterNoImages(false); setFilterNoStacks(false); setFilterNoCategories(false); setPage(1) }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body text-grey-20 hover:text-white border border-white/5 hover:border-white/20 transition-all"
              >
                <X size={11} />
                Limpar
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
                  {projects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableColumns.length + 1}
                        className="px-4 py-12 text-center text-sm font-body text-grey-20"
                      >
                        Nenhum projeto encontrado.
                      </td>
                    </tr>
                  ) : (
                    projects.map((proj) => (
                      <tr
                        key={proj.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {proj.title}
                        </td>
                        <td className="px-4 py-3 text-sm font-body">
                          <div className="flex flex-wrap gap-1">
                            {(proj.categories ?? []).length > 0
                              ? (proj.categories ?? []).map((pc) => (
                                  <span
                                    key={pc.category.id}
                                    className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full border border-white/10"
                                    style={{ backgroundColor: `${pc.category.color || '#5e81ac'}20`, color: pc.category.color || '#5e81ac' }}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pc.category.color || '#5e81ac' }} />
                                    {pc.category.name}
                                  </span>
                                ))
                              : <span className="text-xs text-grey-20">Sem categoria</span>
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-body">
                          <div className="flex flex-wrap gap-1">
                            {(proj.stacks ?? []).length > 0
                              ? (proj.stacks ?? []).map((ps) => {
                                  const color = ps.stackDetail.category?.color || '#5e81ac'
                                  return (
                                    <span
                                      key={ps.stackDetail.id}
                                      className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full border"
                                      style={{ backgroundColor: `${color}15`, color, borderColor: `${color}30` }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                      {ps.stackDetail.name}
                                    </span>
                                  )
                                })
                              : <span className="text-xs text-grey-20">Sem stack</span>
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-body">
                          {proj.featured
                            ? <span className="px-2 py-0.5 rounded-full bg-green/20 text-green text-xs">Sim</span>
                            : <span className="px-2 py-0.5 rounded-full bg-red/20 text-red text-xs">Nao</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-30 text-center">
                          {proj.order ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(proj)}
                              className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteId(proj.id)}
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
          title={editingId ? 'Editar projeto' : 'Novo projeto'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Título"
                value={form.title}
                onChange={(e) => setField('title')(e.target.value)}
                required
                placeholder="Nome do projeto"
              />
              <FormField
                label="Ordem"
                type="number"
                value={form.order}
                onChange={(e) => setField('order')(e.target.value)}
                placeholder="0"
              />
            </div>

            <FormField
              as="textarea"
              label="Descrição curta"
              value={form.description}
              onChange={(e) => setField('description')(e.target.value)}
              required
              rows={2}
              placeholder="Breve descrição do projeto"
            />

            <FormField
              as="textarea"
              label="Descrição longa"
              value={form.longDescription}
              onChange={(e) => setField('longDescription')(e.target.value)}
              rows={4}
              placeholder="Descrição detalhada (opcional)"
            />

            {/* Categorias - multi-select com visual claro */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-body font-medium text-grey-30 mb-2">
                  Categorias
                  {form.categoryIds.length > 0 && (
                    <span className="ml-2 text-xs text-accent">({form.categoryIds.length} selecionada{form.categoryIds.length > 1 ? 's' : ''})</span>
                  )}
                </label>
                <div className="bg-background/50 border border-white/5 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isSelected = form.categoryIds.includes(cat.id)
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleFormCategory(cat.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all border ${
                            isSelected
                              ? 'border-primary bg-primary/20 text-white'
                              : 'border-white/10 bg-transparent text-grey-20 hover:border-white/30'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#5e81ac' }} />
                          {cat.name}
                          {isSelected && <X size={12} className="ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Stacks vinculadas - multi-select com visual claro */}
            {stacks.length > 0 && (
              <div>
                <label className="block text-sm font-body font-medium text-grey-30 mb-2">
                  Stacks Vinculadas
                  {form.stackIds.length > 0 && (
                    <span className="ml-2 text-xs text-accent">({form.stackIds.length} selecionada{form.stackIds.length > 1 ? 's' : ''})</span>
                  )}
                </label>
                <div className="bg-background/50 border border-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {stacks.map((stack) => {
                      const isSelected = form.stackIds.includes(stack.id)
                      return (
                        <button
                          key={stack.id}
                          type="button"
                          onClick={() => toggleFormStack(stack.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all border ${
                            isSelected
                              ? 'border-green bg-green/20 text-white'
                              : 'border-white/10 bg-transparent text-grey-20 hover:border-white/30'
                          }`}
                        >
                          {stack.name}
                          {isSelected && <X size={12} className="ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="URL GitHub"
                type="url"
                value={form.githubUrl}
                onChange={(e) => setField('githubUrl')(e.target.value)}
                placeholder="https://github.com/..."
              />
              <FormField
                label="URL Demo"
                type="url"
                value={form.demoUrl}
                onChange={(e) => setField('demoUrl')(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Image manager */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-body text-grey-30">
                  Imagens / Screenshots
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, images: [...prev.images, { url: '', alt: '' }] }))
                  }
                  className="text-xs font-body text-accent hover:text-white transition-colors"
                >
                  + Adicionar imagem
                </button>
              </div>
              {form.images.length === 0 && (
                <p className="text-xs font-body text-grey-20 bg-background/50 border border-white/5 rounded-lg p-3">
                  Nenhuma imagem. Clique em "Adicionar imagem" para inserir URLs de screenshots.
                </p>
              )}
              <div className="space-y-2">
                {form.images.map((img, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="url"
                        value={img.url}
                        onChange={(e) => {
                          const updated = [...form.images]
                          updated[i] = { ...updated[i], url: e.target.value }
                          setForm((prev) => ({ ...prev, images: updated }))
                        }}
                        placeholder="https://raw.githubusercontent.com/..."
                        className="sm:col-span-2 w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none"
                      />
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => {
                          const updated = [...form.images]
                          updated[i] = { ...updated[i], alt: e.target.value }
                          setForm((prev) => ({ ...prev, images: updated }))
                        }}
                        placeholder="Descricao (alt)"
                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))
                      }
                      className="p-2 text-grey-20 hover:text-red transition-colors flex-shrink-0"
                      title="Remover imagem"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField('featured')(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-background text-primary focus:ring-primary"
              />
              <span className="text-sm font-body text-grey-30">Projeto em destaque</span>
            </label>

            {error && (
              <p className="text-red text-sm font-body">{error}</p>
            )}

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
          message="Tem certeza que deseja excluir este projeto? Esta acao nao pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
