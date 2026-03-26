import { useState, useCallback, memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStacks } from '@/hooks/useStacks'
import { Header } from '@/components/Header'
import { HighlightCard } from '@/components/HighlightCard'
import { useStats } from '@/hooks/useStats'
import { PageBackground } from '@/components/PageBackground'
import { Footer } from '@/components/Footer'
import type { StackDetail } from '@/types'
import {
  ChevronDown,
  ChevronUp,
  Code,
  Database,
  Cloud,
  Cpu,
  Layers,
  TestTube,
  Monitor,
  Workflow,
} from 'lucide-react'

const iconMap: Record<string, typeof Code> = {
  'code': Code,
  'layers': Layers,
  'database': Database,
  'workflow': Workflow,
  'cloud': Cloud,
  'cpu': Cpu,
  'monitor': Monitor,
  'test-tube': TestTube,
}

const levelColors: Record<string, string> = {
  'Especialista': 'bg-green/20 text-green border-green/30',
  'Avançado': 'bg-[#5e81ac]/20 text-[#5e81ac] border-[#5e81ac]/30',
  'Intermediário-Avançado': 'bg-[#81a1c1]/20 text-[#81a1c1] border-[#81a1c1]/30',
  'Intermediário': 'bg-yellow/20 text-yellow border-yellow/30',
  'Básico': 'bg-orange/20 text-orange border-orange/30',
}

const currentYear = new Date().getFullYear()

function formatYearsPublic(startYear: number, endYear: number | null): string {
  const end = endYear ?? currentYear
  const diff = end - startYear
  if (diff < 1) return '< 1 ano'
  return `${diff}+ ano${diff > 1 ? 's' : ''} (${startYear} - ${endYear ? endYear : 'Atual'})`
}

const StackCard = memo(({ stack, isOpen, onToggle }: { stack: StackDetail; isOpen: boolean; onToggle: () => void }) => {
  const open = isOpen

  const catIcon = stack.category?.icon || 'code'
  const Icon = iconMap[catIcon] || Code
  const catColor = stack.category?.color || '#5e81ac'

  return (
    <div className="rounded-2xl border border-white/5 bg-surface/90 overflow-hidden transition-all hover:border-primary/20">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-5 md:p-6 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${catColor}20` }}>
              <Icon className="h-5 w-5" style={{ color: catColor }} />
            </div>
            <div>
              <h3 className="font-header text-lg font-semibold text-white">{stack.name}</h3>
              <p className="font-body text-xs text-grey-20">{formatYearsPublic(stack.startYear, stack.endYear)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-0.5 font-body text-xs font-medium ${levelColors[stack.level] || 'bg-white/10 text-grey-30 border-white/20'}`}
            >
              {stack.level}
            </span>
            {open ? (
              <ChevronUp className="h-4 w-4 text-grey-20" />
            ) : (
              <ChevronDown className="h-4 w-4 text-grey-20" />
            )}
          </div>
        </div>

        {/* Quick preview */}
        {!open && (
          <p className="mt-3 font-body text-sm text-grey-30 line-clamp-2">
            {stack.solutions[0]}
            {stack.solutions.length > 1 && ` (+${stack.solutions.length - 1} soluções)`}
          </p>
        )}
      </button>

      {open && (
        <div className="border-t border-white/5 p-5 md:p-6 space-y-5 bg-background/50">
          {/* Projetos Profissionais */}
          {stack.profProjects.length > 0 && (
            <div>
              <h4 className="font-header text-xs font-semibold uppercase tracking-wider text-primary">
                Projetos Profissionais
              </h4>
              <ul className="mt-2 space-y-1">
                {stack.profProjects.map((p) => (
                  <li key={p} className="flex items-start gap-2 font-body text-sm text-grey-30">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Projetos Pessoais */}
          {stack.personalProjects.length > 0 && (
            <div>
              <h4 className="font-header text-xs font-semibold uppercase tracking-wider text-accent">
                Projetos Pessoais
              </h4>
              <ul className="mt-2 space-y-1">
                {stack.personalProjects.map((p) => (
                  <li key={p} className="flex items-start gap-2 font-body text-sm text-grey-30">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Solucoes */}
          <div>
            <h4 className="font-header text-xs font-semibold uppercase tracking-wider text-primary">
              Soluções Implementadas
            </h4>
            <ul className="mt-2 space-y-1">
              {stack.solutions.map((s) => (
                <li key={s} className="flex items-start gap-2 font-body text-sm text-grey-30">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Padroes */}
          {stack.patterns.length > 0 && (
            <div>
              <h4 className="font-header text-xs font-semibold uppercase tracking-wider text-primary">
                Padrões Aplicados
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {stack.patterns.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs text-accent-soft"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

StackCard.displayName = 'StackCard'

const stackStatsDef = [
  { key: 'total', label: 'Tecnologias', icon: Layers, corner: 'from-accent to-primary', bg: 'bg-accent/20', color: 'text-accent' },
  { key: 'experts', label: 'Especialistas', icon: Code, corner: 'from-green to-green/60', bg: 'bg-green/20', color: 'text-green' },
  { key: 'advanced', label: 'Avançados', icon: Database, corner: 'from-purple to-purple/60', bg: 'bg-purple/20', color: 'text-purple' },
  { key: 'maxYears', label: 'Máx. anos', icon: Cpu, corner: 'from-yellow to-yellow/60', bg: 'bg-yellow/20', color: 'text-yellow' },
]

export const StacksPage = memo(() => {
  const { stacks, loading, error } = useStacks()
  const { stats: apiStats } = useStats()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openStackId, setOpenStackId] = useState<string | null>(null)

  const stackStatsValues: Record<string, string> = {
    total: String(apiStats.stacks.totalStacks),
    experts: String(apiStats.stacks.expertCount ?? 0),
    advanced: String(apiStats.stacks.advancedCount ?? 0),
    maxYears: `${apiStats.stacks.oldestStartYear ? new Date().getFullYear() - apiStats.stacks.oldestStartYear : 0}+`,
  }

  const categories = useMemo(() => {
    const catMap = new Map<string, { id: string; name: string; color?: string }>()
    for (const s of stacks) {
      if (s.category && !catMap.has(s.category.id)) {
        catMap.set(s.category.id, s.category)
      }
    }
    return Array.from(catMap.values())
  }, [stacks])

  const filtered = useMemo(() => {
    if (!activeCategory) return stacks
    return stacks.filter((s) => s.categoryId === activeCategory)
  }, [stacks, activeCategory])

  return (
    <div className="relative min-h-screen bg-background text-white flex flex-col">
      <PageBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16 flex-1">
        {/* Hero */}
        <section className="container text-center mb-12">
          <h1 className="font-header text-4xl font-bold uppercase text-primary sm:text-5xl lg:text-6xl">
            {apiStats.pageConfig?.stacksPageTitle || 'Stack & Ferramentas'}
          </h1>
          {(apiStats.pageConfig?.stacksPageSubtitle) && (
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-grey-20">
              {apiStats.pageConfig.stacksPageSubtitle}
            </p>
          )}

          {/* Stats */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stackStatsDef.map((s) => (
              <HighlightCard
                key={s.key}
                value={stackStatsValues[s.key] ?? '0'}
                label={s.label}
                icon={s.icon}
                cornerColor={s.corner}
                iconBg={s.bg}
                iconColor={s.color}
              />
            ))}
          </div>
        </section>

        {/* Category filters */}
        <section className="container mb-10">
          <div className="mx-auto max-w-5xl flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-1.5 font-body text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                !activeCategory
                  ? 'bg-primary text-white'
                  : 'border border-white/10 bg-white/5 text-grey-20 hover:border-primary/30 hover:text-white'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-1.5 font-body text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'border border-white/10 bg-white/5 text-grey-20 hover:border-primary/30 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Stacks grid */}
        <section className="container">
          <div className="mx-auto max-w-5xl">
            {loading && (
              <div className="py-16 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 font-body text-grey-20">Carregando stacks...</p>
              </div>
            )}

            {error && !loading && (
              <div className="py-16 text-center font-body text-red">{error}</div>
            )}

            {!loading && !error && (
              <div className="grid gap-4 md:grid-cols-2 items-start">
                {filtered.map((stack) => (
                  <StackCard
                    key={stack.id}
                    stack={stack}
                    isOpen={openStackId === stack.id}
                    onToggle={() => setOpenStackId(openStackId === stack.id ? null : stack.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
})

StacksPage.displayName = 'StacksPage'
