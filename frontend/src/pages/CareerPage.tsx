import { useState, useCallback, useMemo, memo } from 'react'
import { useCareer } from '@/hooks/useCareer'
import { useStats } from '@/hooks/useStats'
import { Header } from '@/components/Header'
import { PageBackground } from '@/components/PageBackground'
import { Footer } from '@/components/Footer'
import type { CareerEntry, CareerStackItem } from '@/types'
import { ChevronDown, ChevronUp, Briefcase, Layers, Globe, Hash, Clock, Link2, Database, Workflow, Code } from 'lucide-react'
import { HighlightCard } from '@/components/HighlightCard'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatPeriod(start: string, end: string | null): string {
  const s = new Date(start)
  const startStr = `${MONTHS[s.getMonth()]}/${s.getFullYear()}`
  if (!end) return `${startStr} - Atual`
  const e = new Date(end)
  return `${startStr} - ${MONTHS[e.getMonth()]}/${e.getFullYear()}`
}

function calcDuration(start: string, end: string | null): string {
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  if (months < 1) months = 1
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (years === 0) return `${rem} ${rem === 1 ? 'mês' : 'meses'}`
  if (rem === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${rem} ${rem === 1 ? 'mês' : 'meses'}`
}

const groupStacks = (stacks: CareerStackItem[]) => {
  const groups: Record<string, string[]> = {}
  for (const s of stacks) {
    const cat = s.stackDetail.category?.name ?? 'Outros'
    const name = s.stackDetail.name
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(name)
  }
  return groups
}

const TimelineItem = memo(({ entry }: { entry: CareerEntry }) => {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((prev) => !prev), [])
  const stackGroups = groupStacks(entry.stacks)

  return (
    <div className="relative flex gap-4 md:gap-8">
      {/* Timeline dot */}
      <div className="relative z-10 flex-shrink-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary shadow-lg">
          <Briefcase className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <button
          type="button"
          onClick={toggle}
          className="w-full text-left rounded-2xl border border-white/5 bg-surface/90 p-5 md:p-6 shadow-lg transition-all hover:border-primary/30 hover:shadow-xl cursor-pointer"
        >
          {/* Header - always visible */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h3 className="font-header text-xl font-semibold text-white">{entry.role}</h3>
              <p className="mt-1 font-header text-lg font-medium text-primary">{entry.company}</p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
              <span className="font-body text-xs uppercase tracking-wider text-accent-soft">
                {formatPeriod(entry.startDate, entry.endDate)}
              </span>
              <span className="rounded-full bg-primary px-3 py-1 font-header text-sm font-bold text-white shadow">
                {calcDuration(entry.startDate, entry.endDate)}
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.contractType && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-body text-xs text-accent">{entry.contractType}</span>
            )}
            {(entry.domains ?? []).map((d) => (
              <span key={d.domain.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-xs border border-white/10"
                style={{ backgroundColor: `${d.domain.color || '#5e81ac'}15`, color: d.domain.color || '#5e81ac' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.domain.color || '#5e81ac' }} />
                {d.domain.name}
              </span>
            ))}
          </div>

          <p className="mt-3 font-body text-sm leading-relaxed text-grey-30">
            {entry.summary}
          </p>

          {/* Stack badges preview (always visible) */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {entry.stacks.slice(0, 8).map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-xs text-accent-soft"
              >
                {s.stackDetail.name}
              </span>
            ))}
            {entry.stacks.length > 8 && (
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-body text-xs text-grey-20">
                +{entry.stacks.length - 8}
              </span>
            )}
          </div>

          {/* Expand indicator */}
          <div className="mt-3 flex items-center justify-center gap-2 text-grey-20">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="font-body text-xs uppercase tracking-wider">
              {open ? 'Recolher detalhes' : 'Ver detalhes completos'}
            </span>
          </div>
        </button>

        {/* Expanded details */}
        {open && (
          <div className="mt-2 rounded-2xl border border-primary/20 bg-background/95 p-5 md:p-6 space-y-6 animate-in fade-in duration-200">
            {/* Tipos de Projeto */}
            <div>
              <h4 className="flex items-center gap-2 font-header text-sm font-semibold uppercase tracking-wider text-primary">
                <Layers className="h-4 w-4" />
                Tipos de Projeto
              </h4>
              <ul className="mt-3 space-y-1.5">
                {entry.projectTypes.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 font-body text-sm text-grey-30">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Acoes */}
            <div>
              <h4 className="flex items-center gap-2 font-header text-sm font-semibold uppercase tracking-wider text-primary">
                <Hash className="h-4 w-4" />
                O que eu fiz
              </h4>
              <ul className="mt-3 space-y-1.5">
                {entry.actions.map((action) => (
                  <li key={action} className="flex items-start gap-2 font-body text-sm text-grey-30">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stack por categoria */}
            <div>
              <h4 className="flex items-center gap-2 font-header text-sm font-semibold uppercase tracking-wider text-primary">
                <Globe className="h-4 w-4" />
                Stack Completa
              </h4>
              <div className="mt-3 space-y-3">
                {Object.entries(stackGroups).map(([category, techs]) => (
                  <div key={category}>
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-grey-20">
                      {category}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {techs.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-primary/15 px-3 py-1 font-body text-xs text-accent-soft"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

TimelineItem.displayName = 'TimelineItem'

const statsDef = [
  { key: 'years', label: 'Anos de experiência', icon: Clock, corner: 'from-accent to-primary', bg: 'bg-accent/20', color: 'text-accent' },
  { key: 'entries', label: 'Experiências', icon: Briefcase, corner: 'from-green to-green/60', bg: 'bg-green/20', color: 'text-green' },
  { key: 'domains', label: 'Domínios', icon: Globe, corner: 'from-yellow to-yellow/60', bg: 'bg-yellow/20', color: 'text-yellow' },
  { key: 'stacks', label: 'Tecnologias', icon: Layers, corner: 'from-purple to-purple/60', bg: 'bg-purple/20', color: 'text-purple' },
]

// Domains and patterns are derived from career data - no hardcoded values

export const CareerPage = memo(() => {
  const { career, loading, error } = useCareer()
  const { stats: apiStats } = useStats()

  const pageConfig = apiStats.pageConfig

  const statsValues: Record<string, string> = {
    years: apiStats.career.totalYears,
    entries: String(apiStats.career.totalEntries),
    domains: String(apiStats.career.totalDomains),
    stacks: String(apiStats.stacks.totalStacks),
  }

  // Domínios extraídos dos dados de career (dinâmico)
  const domains = useMemo(() => {
    const domainMap = new Map<string, { name: string; color?: string }>()
    for (const c of career) {
      for (const d of (c.domains ?? [])) {
        domainMap.set(d.domain.id, { name: d.domain.name, color: d.domain.color })
      }
    }
    return Array.from(domainMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [career])

  // Padrões arquiteturais extraídos das stacks dos career entries (dinâmico)
  const archPatterns = useMemo(() => {
    const stackGroups: Record<string, Set<string>> = {}
    for (const entry of career) {
      for (const stack of entry.stacks) {
        if ((stack.stackDetail.category?.name ?? '').includes('Arquitetura')) {
          if (!stackGroups[stack.stackDetail.name]) stackGroups[stack.stackDetail.name] = new Set()
          stackGroups[stack.stackDetail.name].add(entry.company)
        }
      }
    }
    return Object.entries(stackGroups).map(([name, companies]) => ({
      name,
      detail: `Aplicado em ${companies.size} empresa${companies.size > 1 ? 's' : ''}`,
    }))
  }, [career])

  return (
    <div className="relative min-h-screen bg-background text-white flex flex-col">
      <PageBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16 flex-1">
        {/* Hero */}
        <section className="container text-center mb-16">
          <h1 className="font-header text-4xl font-bold uppercase text-primary sm:text-5xl lg:text-6xl">
            {pageConfig?.careerPageTitle || 'Histórico Profissional'}
          </h1>
          {(pageConfig?.careerPageSubtitle) && (
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-grey-20">
              {pageConfig.careerPageSubtitle}
            </p>
          )}

          {/* Stats */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {statsDef.map((s) => (
              <HighlightCard
                key={s.key}
                value={statsValues[s.key] ?? '0'}
                label={s.label}
                icon={s.icon}
                cornerColor={s.corner}
                iconBg={s.bg}
                iconColor={s.color}
              />
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="container">
          <div className="mx-auto max-w-4xl">
            {loading && (
              <div className="py-16 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 font-body text-grey-20">Carregando histórico...</p>
              </div>
            )}

            {error && !loading && (
              <div className="py-16 text-center font-body text-red">{error}</div>
            )}

            {!loading && !error && (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-primary/20" />

                <div className="space-y-2">
                  {career.map((entry) => (
                    <TimelineItem key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Architectural Patterns */}
        <section className="relative mt-20 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-darker/60 via-surface/80 to-primary-dark/40" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="container relative">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Layers className="h-7 w-7 text-primary" />
                <h2 className="text-center font-header text-3xl font-semibold uppercase text-primary sm:text-4xl">
                  Padrões Arquiteturais
                </h2>
              </div>
              <p className="mt-3 text-center font-body text-sm text-grey-20">
                Padrões que já apliquei em produção
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archPatterns.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-xl border border-white/10 bg-background/70 backdrop-blur-sm p-5"
                  >
                    <h3 className="font-header text-lg font-semibold text-white">{p.name}</h3>
                    <p className="mt-2 font-body text-sm text-grey-20">{p.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Domains */}
        <section className="relative mt-0 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-surface/80 via-primary-darker/40 to-surface/60" />

          <div className="container relative">
            <div className="mx-auto max-w-4xl text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Globe className="h-7 w-7 text-primary" />
                <h2 className="font-header text-3xl font-semibold uppercase text-primary sm:text-4xl">
                  Domínios de Negócio
                </h2>
              </div>
              <p className="mt-3 font-body text-sm text-grey-20">
                Setores em que atuei profissionalmente
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {domains.map((d) => (
                  <span
                    key={d.name}
                    className="inline-flex items-center gap-2 rounded-full border px-5 py-2 font-body text-sm font-medium"
                    style={{ backgroundColor: `${d.color || '#5e81ac'}15`, color: d.color || '#5e81ac', borderColor: `${d.color || '#5e81ac'}30` }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color || '#5e81ac' }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
})

CareerPage.displayName = 'CareerPage'
