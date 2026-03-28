/**
 * @file AdminDashboard.tsx
 * Main admin dashboard page. Displays stat cards, interactive charts
 * (horizontal bar, pie/donut), portfolio health indicators, recent activity
 * and quick action shortcuts.
 */

import { FC, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Briefcase,
  Layers,
  Wrench,
  MessageSquare,
  LayoutDashboard,
  Plus,
  Edit,
  Clock,
  ArrowRight,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Globe,
} from 'lucide-react'
import {
  fetchAdminProjects,
  fetchAdminCareer,
  fetchAdminStacks,
  fetchAdminServices,
  fetchAdminContacts,
  fetchAdminCategories,
  fetchEducation,
} from '@/services/api'
import type { AdminCategory } from '@/services/api'
import { StatCard } from './components/StatCard'
import { QuickAction } from './components/QuickAction'
import type { Project, CareerEntry, StackDetail } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Represents a recently updated item shown in the activity feed. */
type RecentItem = {
  id: string
  title: string
  subtitle: string
  type: 'project' | 'career' | 'stack'
  path: string
  updatedAt: string
}

/** Minimal education item shape needed for health indicator calculation. */
type EducationItem = {
  id: string
  status: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEVEL_COLORS: Record<string, string> = {
  'Especialista': '#a3be8c',
  'Avançado': '#5e81ac',
  'Intermediário': '#88c0d0',
  'Intermediário-Avançado': '#81a1c1',
  'Básico': '#ebcb8b',
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable relative time string (e.g. "5min atrás", "2d atrás").
 *
 * @param dateStr - ISO date string to compare against now.
 */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d atrás`
  return `${Math.floor(days / 30)}m atrás`
}

// ---------------------------------------------------------------------------
// Chart sub-components
// ---------------------------------------------------------------------------

/** Props for the horizontal bar chart component. */
type HBarProps = {
  items: { label: string; value: number; color: string }[]
  title: string
  icon: FC<{ size?: number; className?: string }>
  iconColor: string
  cornerColor: string
}

/**
 * Renders a horizontal bar chart with hover tooltips showing value and percentage.
 */
function HBarChart({ items, title, icon: Icon, iconColor, cornerColor }: HBarProps) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const total = items.reduce((s, i) => s + i.value, 0)
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="relative bg-surface rounded-xl border border-white/5 p-5 overflow-hidden h-full">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cornerColor} opacity-10 rounded-bl-full`} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={16} className={iconColor} />
          <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">{title}</h4>
        </div>
        <div className="space-y-2">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
            const isHovered = hovered === item.label
            return (
              <div key={item.label} className="flex items-center gap-3 relative"
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}>
                <span className="w-32 text-xs font-body text-grey-30 truncate flex-shrink-0">{item.label}</span>
                <div className="flex-1 h-5 bg-background/50 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all ${isHovered ? 'brightness-125' : ''}`}
                    style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="text-xs font-body font-semibold text-white w-6 text-right">{item.value}</span>
                {isHovered && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 bg-background border border-white/10 rounded-lg px-3 py-1.5 shadow-lg pointer-events-none whitespace-nowrap">
                    <span className="text-xs font-body text-white font-semibold">{item.label}</span>
                    <span className="text-xs font-body text-grey-20 ml-2">{item.value} ({pct}%)</span>
                  </div>
                )}
              </div>
            )
          })}
          {items.length === 0 && (
            <p className="text-xs font-body text-grey-20 py-4 text-center">Sem dados</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Props for the pie / donut chart component. */
type PieChartProps = {
  items: { label: string; value: number; color: string }[]
  title: string
  icon: FC<{ size?: number; className?: string }>
  iconColor: string
  cornerColor: string
}

/**
 * Renders a CSS conic-gradient donut chart with an interactive legend.
 * Hovering a segment shows the count and percentage in the centre.
 */
function PieChart({ items, title, icon: Icon, iconColor, cornerColor }: PieChartProps) {
  const total = items.reduce((sum, i) => sum + i.value, 0) || 1
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)

  // Build conic-gradient segments
  let accumulated = 0
  const segments = items.map((item) => {
    const start = accumulated
    accumulated += (item.value / total) * 360
    return { ...item, start, end: accumulated }
  })
  const gradient = segments.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(', ')

  const hoveredItem = items.find((i) => i.label === hoveredLabel)

  return (
    <div className="relative bg-surface rounded-xl border border-white/5 p-5 overflow-hidden flex flex-col h-full">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cornerColor} opacity-10 rounded-bl-full`} />
      <div className="relative flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={16} className={iconColor} />
          <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">{title}</h4>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 py-2 gap-5">
          {/* Donut */}
          <div className="flex-shrink-0 relative"
            onMouseLeave={() => setHoveredLabel(null)}>
            <div
              className="w-44 h-44 rounded-full relative"
              style={{ background: `conic-gradient(${gradient})` }}
            >
              {/* Invisible SVG segments for hover interactivity */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {segments.map((seg) => {
                  const startRad = ((seg.start - 90) * Math.PI) / 180
                  const endRad = ((seg.end - 90) * Math.PI) / 180
                  const x1 = 50 + 50 * Math.cos(startRad)
                  const y1 = 50 + 50 * Math.sin(startRad)
                  const x2 = 50 + 50 * Math.cos(endRad)
                  const y2 = 50 + 50 * Math.sin(endRad)
                  const largeArc = seg.end - seg.start > 180 ? 1 : 0
                  return (
                    <path
                      key={seg.label}
                      d={`M50,50 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill="transparent"
                      onMouseEnter={() => setHoveredLabel(seg.label)}
                      className="cursor-pointer"
                    />
                  )
                })}
              </svg>
              <div className="absolute inset-[14%] rounded-full bg-surface flex flex-col items-center justify-center pointer-events-none">
                {hoveredItem ? (
                  <>
                    <span className="text-2xl font-header font-bold text-white">{hoveredItem.value}</span>
                    <span className="text-[10px] font-body text-grey-20">{Math.round((hoveredItem.value / total) * 100)}%</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-header font-bold text-white">{total}</span>
                    <span className="text-[10px] font-body text-grey-20">stacks</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Chart legend */}
          <div className="w-full space-y-2">
            {items.map((item) => {
              const pct = Math.round((item.value / total) * 100)
              const isHovered = hoveredLabel === item.label
              return (
                <div key={item.label}
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors cursor-default ${isHovered ? 'bg-white/5' : ''}`}
                  onMouseEnter={() => setHoveredLabel(item.label)}
                  onMouseLeave={() => setHoveredLabel(null)}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 text-xs font-body text-grey-30">{item.label}</span>
                  <span className="text-xs font-body font-semibold text-white">{item.value}</span>
                  <span className="text-[10px] font-body text-grey-20 w-8 text-right">({pct}%)</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/** A single portfolio health indicator row. */
type HealthItem = {
  label: string
  value: number
  total: number
  good: boolean
}

/**
 * Renders a list of portfolio health indicators showing completeness percentages.
 * Green check for healthy items, yellow warning for items needing attention.
 */
function HealthIndicators({ items }: { items: HealthItem[] }) {
  return (
    <div className="relative bg-surface rounded-xl border border-white/5 p-5 overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow to-orange opacity-10 rounded-bl-full" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-yellow" />
          <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Saúde do Portfolio</h4>
        </div>
        <div className="space-y-2">
          {items.map((item) => {
            const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
            return (
              <div key={item.label} className="flex items-center gap-3 py-1">
                {item.good ? (
                  <CheckCircle size={14} className="text-green flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-yellow flex-shrink-0" />
                )}
                <span className="flex-1 text-xs font-body text-grey-30">{item.label}</span>
                <span className={`text-xs font-body font-semibold ${item.good ? 'text-green' : 'text-yellow'}`}>
                  {item.value}/{item.total} ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Renders the admin dashboard with stats, charts, health indicators,
 * recent activity and quick action shortcuts.
 * Used at the /admin/dashboard route.
 */
export const AdminDashboard: FC = () => {
  const [counts, setCounts] = useState({ projects: 0, career: 0, stacks: 0, services: 0, contacts: 0, educations: 0 })
  const [projectsData, setProjectsData] = useState<Project[]>([])
  const [careerData, setCareerData] = useState<CareerEntry[]>([])
  const [stacksData, setStacksData] = useState<StackDetail[]>([])
  const [educationData, setEducationData] = useState<EducationItem[]>([])
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, career, stacks, services, contacts, educations] = await Promise.allSettled([
          fetchAdminProjects(),
          fetchAdminCareer(),
          fetchAdminStacks(),
          fetchAdminServices(),
          fetchAdminContacts(),
          fetchEducation(),
        ])

        const pData = projects.status === 'fulfilled' ? projects.value : []
        const cData = career.status === 'fulfilled' ? career.value : []
        const sData = stacks.status === 'fulfilled' ? stacks.value : []
        const eData = educations.status === 'fulfilled' ? educations.value : []

        setProjectsData(pData)
        setCareerData(cData as CareerEntry[])
        setStacksData(sData as StackDetail[])
        setEducationData(eData as EducationItem[])
        setCounts({
          projects: pData.length,
          career: cData.length,
          stacks: sData.length,
          services: services.status === 'fulfilled' ? services.value.length : 0,
          contacts: contacts.status === 'fulfilled' ? contacts.value.length : 0,
          educations: eData.length,
        })

        // Build recent items
        const recent: RecentItem[] = [
          ...(pData as (Project & { updatedAt?: string })[]).map((p) => ({
            id: p.id,
            title: p.title,
            subtitle: p.categoryLabel || p.category,
            type: 'project' as const,
            path: '/admin/projects',
            updatedAt: (p as unknown as Record<string, string>).updatedAt ?? new Date().toISOString(),
          })),
          ...(cData as (CareerEntry & { updatedAt?: string })[]).map((c) => ({
            id: c.id,
            title: c.company,
            subtitle: `${c.role} - ${c.company}`,
            type: 'career' as const,
            path: '/admin/career',
            updatedAt: (c as unknown as Record<string, string>).updatedAt ?? new Date().toISOString(),
          })),
          ...(sData as (StackDetail & { updatedAt?: string })[]).map((s) => ({
            id: s.id,
            title: s.name,
            subtitle: `${s.category?.name ?? ''} - ${s.startYear}${s.endYear ? ` a ${s.endYear}` : ' - Atual'}`,
            type: 'stack' as const,
            path: '/admin/stacks',
            updatedAt: (s as unknown as Record<string, string>).updatedAt ?? new Date().toISOString(),
          })),
        ]

        recent.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        setRecentItems(recent.slice(0, 8))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  // --- Derived chart data ---

  /** Groups stacks by proficiency level for the pie chart. */
  const stacksByLevel = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of stacksData) {
      counts[s.level] = (counts[s.level] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value, color: LEVEL_COLORS[label] || '#5e81ac' }))
  }, [stacksData])

  /** Groups stacks by category for the horizontal bar chart. */
  const stacksByCategory = useMemo(() => {
    const counts: Record<string, { name: string; color: string; count: number }> = {}
    for (const s of stacksData) {
      const cat = s.category
      if (!cat) continue
      if (!counts[cat.id]) counts[cat.id] = { name: cat.name, color: cat.color || '#5e81ac', count: 0 }
      counts[cat.id].count++
    }
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .map((c) => ({ label: c.name, value: c.count, color: c.color }))
  }, [stacksData])

  /** Groups career entries by business domain for the horizontal bar chart. */
  const careerByDomain = useMemo(() => {
    const counts: Record<string, { name: string; color: string; count: number }> = {}
    for (const c of careerData) {
      for (const d of (c.domains ?? [])) {
        const dom = d.domain
        if (!counts[dom.id]) counts[dom.id] = { name: dom.name, color: dom.color || '#5e81ac', count: 0 }
        counts[dom.id].count++
      }
    }
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .map((d) => ({ label: d.name, value: d.count, color: d.color }))
  }, [careerData])

  const healthItems = useMemo((): HealthItem[] => {
    const totalProjects = projectsData.length
    const withImages = projectsData.filter((p) => (p.images?.length ?? 0) > 0).length
    const withStacks = projectsData.filter((p) => (p.stacks?.length ?? 0) > 0).length
    const withCategories = projectsData.filter((p) => (p.categories?.length ?? 0) > 0).length
    const totalCareer = careerData.length
    const withDomains = careerData.filter((c) => (c.domains?.length ?? 0) > 0).length
    const totalEdu = educationData.length
    const completedEdu = educationData.filter((e) => e.status === 'completed').length

    return [
      { label: 'Projetos com imagens', value: withImages, total: totalProjects, good: withImages === totalProjects },
      { label: 'Projetos com stacks', value: withStacks, total: totalProjects, good: withStacks === totalProjects },
      { label: 'Projetos com categorias', value: withCategories, total: totalProjects, good: withCategories === totalProjects },
      { label: 'Experiências com domínio', value: withDomains, total: totalCareer, good: withDomains === totalCareer },
      { label: 'Formações concluídas', value: completedEdu, total: totalEdu, good: completedEdu > 0 },
    ]
  }, [projectsData, careerData, educationData])

  // --- Icon and colour maps for recent activity item types ---
  const typeIcon: Record<string, FC<{ size?: number; className?: string }>> = {
    project: FolderKanban,
    career: Briefcase,
    stack: Layers,
  }
  const typeColor: Record<string, string> = {
    project: 'text-nord-8',
    career: 'text-purple',
    stack: 'text-green',
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Dashboard header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/20 rounded-xl">
          <LayoutDashboard size={22} className="text-accent" />
        </div>
        <div>
          <h2 className="font-header text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-grey-20 text-sm font-body">Visão geral do portfólio</p>
        </div>
      </div>

      {/* Summary stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-white/5 rounded-xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Projetos" value={counts.projects} icon={FolderKanban}
            cornerColor="from-nord-8 to-nord-10" iconBg="bg-nord-8/20" iconColor="text-nord-8" path="/admin/projects" />
          <StatCard label="Histórico" value={counts.career} icon={Briefcase}
            cornerColor="from-purple to-purple/60" iconBg="bg-purple/20" iconColor="text-purple" path="/admin/career" />
          <StatCard label="Stacks" value={counts.stacks} icon={Layers}
            cornerColor="from-green to-green/60" iconBg="bg-green/20" iconColor="text-green" path="/admin/stacks" />
          <StatCard label="Serviços" value={counts.services} icon={Wrench}
            cornerColor="from-yellow to-yellow/60" iconBg="bg-yellow/20" iconColor="text-yellow" path="/admin/services" />
          <StatCard label="Contatos" value={counts.contacts} icon={MessageSquare}
            cornerColor="from-orange to-orange/60" iconBg="bg-orange/20" iconColor="text-orange" path="/admin/contacts" />
          <StatCard label="Formações" value={counts.educations} icon={GraduationCap}
            cornerColor="from-nord-8 to-nord-7" iconBg="bg-nord-8/20" iconColor="text-nord-8" path="/admin/education" />
        </div>
      )}

      {/* Row 1: Stacks by Level (pie — 2 cols) + Projects by Category (bars — 4 cols) */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {stacksData.length > 0 && <div className="lg:col-span-2"><PieChart items={stacksByLevel} title="Stacks por Nível" icon={BarChart3} iconColor="text-green" cornerColor="from-green to-green/40" /></div>}
          {projectsData.length > 0 && <div className="lg:col-span-4">{(() => {
            const catCounts: Record<string, { name: string; color: string; count: number }> = {}
            for (const p of projectsData) {
              for (const pc of (p.categories ?? [])) {
                const key = pc.category.id
                if (!catCounts[key]) catCounts[key] = { name: pc.category.name, color: pc.category.color || '#5e81ac', count: 0 }
                catCounts[key].count++
              }
            }
            const sorted = Object.values(catCounts).sort((a, b) => b.count - a.count).map((c) => ({ label: c.name, value: c.count, color: c.color }))
            return <HBarChart items={sorted} title="Projetos por Categoria" icon={Layers} iconColor="text-purple" cornerColor="from-purple to-purple/40" />
          })()}</div>}
        </div>
      )}

      {/* Row 2: Stacks by Category + Career by Domain (each 6 cols) */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stacksData.length > 0 && <HBarChart items={stacksByCategory} title="Stacks por Categoria" icon={Layers} iconColor="text-accent" cornerColor="from-accent to-primary" />}
          {careerData.length > 0 && <HBarChart items={careerByDomain} title="Histórico por Domínio" icon={Globe} iconColor="text-orange" cornerColor="from-orange to-orange/40" />}
        </div>
      )}

      {/* Row 3: Health indicators + Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Portfolio health indicators */}
        {!loading && <HealthIndicators items={healthItems} />}

        {/* Recent activity feed */}
        <div className="lg:col-span-2 relative bg-surface rounded-xl overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nord-8 to-nord-10 opacity-10 rounded-bl-full" />
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-accent" />
              <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Atividade Recente</h4>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-background/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentItems.length === 0 ? (
              <p className="text-grey-20 text-sm font-body py-8 text-center">Nenhuma atividade registrada.</p>
            ) : (
              <div className="space-y-1">
                {recentItems.map((item) => {
                  const Icon = typeIcon[item.type] || FolderKanban
                  const color = typeColor[item.type] || 'text-accent'
                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={item.path}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-background/50 transition-colors group"
                    >
                      <Icon size={14} className={color} />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-white truncate">{item.title}</p>
                        <p className="font-body text-xs text-grey-20 truncate">{item.subtitle}</p>
                      </div>
                      <span className="font-body text-xs text-grey-10 flex-shrink-0">{timeAgo(item.updatedAt)}</span>
                      <ArrowRight size={14} className="text-grey-10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="relative bg-surface rounded-xl overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary to-primary-dark opacity-10 rounded-bl-full" />
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={16} className="text-accent" />
              <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Ações Rápidas</h4>
            </div>
            <div className="space-y-2.5">
              <QuickAction label="Novo Projeto" path="/admin/projects" icon={Plus} iconBg="bg-nord-8/20" iconColor="text-nord-8" />
              <QuickAction label="Nova Experiência" path="/admin/career" icon={Plus} iconBg="bg-purple/20" iconColor="text-purple" />
              <QuickAction label="Nova Stack" path="/admin/stacks" icon={Plus} iconBg="bg-green/20" iconColor="text-green" />
              <QuickAction label="Editar Perfil" path="/admin/profile" icon={Edit} iconBg="bg-yellow/20" iconColor="text-yellow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
