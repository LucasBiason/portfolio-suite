/**
 * @file AdminContacts.tsx
 * Admin page for managing contact channel entries (social links and direct contact info).
 * Provides a filterable, sortable list with a modal form for creating and editing contacts.
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
  Globe,
  MessageSquare,
  Pencil,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { StatCard } from './components/StatCard'
import {
  fetchFilteredContacts,
  createContact,
  updateContact,
  deleteContact,
} from '@/services/api'
import { PageHeader } from './components/PageHeader'
import { Modal } from './components/Modal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { FormField } from './components/FormField'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Sort direction for the contacts table columns. */
type SortDir = 'asc' | 'desc' | null

/** Represents a contact channel record returned by the admin API. */
type ContactItem = {
  id: string
  title: string
  value: string
  href: string | null
  icon: string
  type: 'social' | 'contact'
  order?: number
}

/** Controlled form state for creating or editing a contact entry. */
type ContactForm = {
  title: string
  value: string
  href: string
  icon: string
  type: 'social' | 'contact'
  order: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a blank ContactForm initialised with sensible defaults. */
const emptyForm = (): ContactForm => ({
  title: '',
  value: '',
  href: '',
  icon: '',
  type: 'contact',
  order: '0',
})

/** Maps a ContactItem API object into the controlled form shape for editing. */
const contactToForm = (c: ContactItem): ContactForm => ({
  title: c.title,
  value: c.value,
  href: c.href ?? '',
  icon: c.icon,
  type: c.type,
  order: String(c.order ?? 0),
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

/** Props for the Chip filter button. */
type ChipProps = {
  label: string
  active: boolean
  onClick: () => void
}

/** Renders a toggle chip button used in the contact type filter bar. */
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

/**
 * Renders the admin contacts management page.
 * Allows creating, editing and deleting contact channel entries (social and direct contact).
 * Used at the /admin/contacts route.
 */
export const AdminContacts: FC = () => {
  // Server data
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // All contacts (unfiltered) for stats
  const [allContacts, setAllContacts] = useState<ContactItem[]>([])

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContactForm>(emptyForm())
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

  // Load all contacts once for stats
  useEffect(() => {
    void fetchFilteredContacts({ pageSize: 500 }).then((r) => {
      setAllContacts(r.data as ContactItem[])
    }).catch(() => undefined)
  }, [])

  // Load contacts whenever filter/sort/page changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchFilteredContacts({
        search: debouncedSearch || undefined,
        type: selectedType || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir: sortDir ?? undefined,
      })
      setContacts(result.data as ContactItem[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError('Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedType, page, sortBy, sortDir])

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

  const openEdit = (c: ContactItem) => {
    setEditingId(c.id)
    setForm(contactToForm(c))
    setError(null)
    setModalOpen(true)
  }

  const set = (field: keyof ContactForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  // Form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title,
      value: form.value,
      href: form.href || null,
      icon: form.icon,
      type: form.type,
      order: parseInt(form.order, 10) || 0,
    }

    try {
      if (editingId) {
        await updateContact(editingId, payload)
      } else {
        await createContact(payload)
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
      await deleteContact(deleteId)
      setDeleteId(null)
      await load()
    } catch {
      setError('Erro ao excluir contato')
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
    { key: 'value', label: 'Valor' },
    { key: 'type', label: 'Tipo' },
    { key: 'icon', label: 'Ícone' },
  ]

  return (
    <div>
      <PageHeader
        title="Contatos"
        subtitle={`${total} contato${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
        onAdd={openAdd}
        addLabel="Novo contato"
        icon={<MessageSquare size={18} />}
      />

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">
          {error}
        </div>
      )}

      {/* Stats */}
      {allContacts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <StatCard label="Total de contatos" value={allContacts.length} icon={MessageSquare}
            cornerColor="from-accent to-primary" iconBg="bg-accent/20" iconColor="text-accent" />
          <StatCard label="Social" value={allContacts.filter((c) => c.type === 'social').length} icon={Globe}
            cornerColor="from-purple to-purple/60" iconBg="bg-purple/20" iconColor="text-purple" />
          <StatCard label="Contact" value={allContacts.filter((c) => c.type === 'contact').length} icon={User}
            cornerColor="from-green to-green/60" iconBg="bg-green/20" iconColor="text-green" />
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
            placeholder="Buscar contatos..."
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

        {/* Type filter chips */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">
            Tipo
          </p>
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'social', label: 'Social', color: '#b48ead' },
              { key: 'contact', label: 'Contact', color: '#5e81ac' },
            ] as const).map((t) => {
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
              <button
                type="button"
                onClick={() => { setSelectedType(''); setPage(1) }}
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
                  {contacts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableColumns.length + 1}
                        className="px-4 py-12 text-center text-sm font-body text-grey-20"
                      >
                        Nenhum contato cadastrado.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {contact.title}
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {contact.value}
                        </td>
                        <td className="px-4 py-3 text-sm font-body">
                          <span
                            className={[
                              'text-xs font-body px-2 py-0.5 rounded-full',
                              contact.type === 'social'
                                ? 'bg-purple/20 text-purple'
                                : 'bg-nord-8/20 text-nord-8',
                            ].join(' ')}
                          >
                            {contact.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-grey-30">
                          {contact.icon
                            ? <i className={`bx ${contact.icon} text-lg text-accent`} />
                            : <span className="text-grey-20">-</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(contact)}
                              className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteId(contact.id)}
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
          title={editingId ? 'Editar contato' : 'Novo contato'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Título"
              value={form.title}
              onChange={(e) => set('title')(e.target.value)}
              required
              placeholder="Ex: LinkedIn"
            />

            <FormField
              label="Valor"
              value={form.value}
              onChange={(e) => set('value')(e.target.value)}
              required
              placeholder="Ex: linkedin.com/in/usuario"
            />

            <FormField
              label="Link (href)"
              value={form.href}
              onChange={(e) => set('href')(e.target.value)}
              placeholder="https://..."
            />

            <FormField
              label="Ícone"
              value={form.icon}
              onChange={(e) => set('icon')(e.target.value)}
              placeholder="Ex: Linkedin, Mail, Github"
              hint="Nome do icone Lucide (lucide.dev/icons) - ex: Linkedin, Mail, Github, Globe, Phone"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body text-grey-30 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => set('type')(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none"
                >
                  <option value="contact">contact</option>
                  <option value="social">social</option>
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
          message="Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
