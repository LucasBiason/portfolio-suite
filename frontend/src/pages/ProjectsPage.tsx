/**
 * @file ProjectsPage.tsx
 * Public page listing personal projects and academic education.
 * Projects are expandable cards with image carousels and long descriptions.
 * Includes aggregate highlight stats and a GitHub CTA.
 */

import { useState, useCallback, useEffect, memo } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { Header } from '@/components/Header'
import { PageBackground } from '@/components/PageBackground'
import { Footer } from '@/components/Footer'
import type { Project } from '@/types'
import { ChevronDown, ChevronUp, ExternalLink, Github, Code, Cpu, Layers, Monitor, Database, BookOpen, GraduationCap, FolderGit2, Award, Wrench } from 'lucide-react'
import { HighlightCard } from '@/components/HighlightCard'
import { useStats } from '@/hooks/useStats'
import { ImageCarouselSimple } from '@/components/ImageCarouselSimple'
import { fetchEducation } from '@/services/api'
import type { EducationItem } from '@/services/api'

/** Renders text with **bold** markdown support */
const RichText = ({ text, className }: { text: string; className?: string }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

const categoryIcons: Record<string, typeof Code> = {
  'fullstack': Layers,
  'backend': Database,
  'ml': Cpu,
  'devtools': Code,
  'infrastructure': Monitor,
  'education': BookOpen,
}

/**
 * Renders an expandable project card with title, description, tech badges
 * and an optional image carousel and long description when expanded.
 */
const ProjectCard = memo(({ project }: { project: Project }) => {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  const Icon = categoryIcons[project.category] || Code

  return (
    <div className="rounded-2xl border border-white/5 bg-surface/90 overflow-hidden transition-all hover:border-primary/20">
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left p-6 md:p-8 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-header text-xl font-semibold text-white">{project.title}</h3>
              {project.categoryLabel && (
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 font-body text-xs text-accent-soft">
                  {project.categoryLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-grey-20 transition-colors hover:bg-primary/20 hover:text-white"
                onClick={(e) => e.stopPropagation()}
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-grey-20 transition-colors hover:bg-primary/20 hover:text-white"
                onClick={(e) => e.stopPropagation()}
                aria-label="Demo"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {open ? (
              <ChevronUp className="h-5 w-5 text-grey-20" />
            ) : (
              <ChevronDown className="h-5 w-5 text-grey-20" />
            )}
          </div>
        </div>

        <p className="mt-4 font-body text-sm leading-relaxed text-grey-30">
          {project.description}
        </p>

        {/* Technology badge chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-xs text-accent-soft"
            >
              {tech}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded long description section */}
      {open && project.longDescription && (
        <div className="border-t border-white/5 p-6 md:p-8 bg-background/50">
          {/* Project screenshot carousel */}
          {project.images && project.images.length > 0 && (
            <ImageCarouselSimple
              images={project.images.map((img) => ({ url: img.url, alt: img.alt }))}
              className="mb-6"
            />
          )}
          <div className="space-y-4">
            {project.longDescription.split('\n\n').map((paragraph, i) => {
              const headerMatch = paragraph.match(/^\*\*(.+?):\*\*\s*(.*)$/)
              if (headerMatch) {
                return (
                  <div key={i}>
                    <h4 className="font-header text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                      {headerMatch[1]}
                    </h4>
                    {headerMatch[2] && (
                      <RichText text={headerMatch[2]} className="font-body text-sm text-grey-30 leading-relaxed" />
                    )}
                  </div>
                )
              }
              return (
                <p key={i} className="font-body text-sm text-grey-30 leading-relaxed">
                  <RichText text={paragraph} />
                </p>
              )
            })}
          </div>

          {/* External links (GitHub, demo) */}
          <div className="mt-6 flex flex-wrap gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 font-body text-xs font-medium text-white transition-all hover:border-primary/30 hover:bg-primary/10"
              >
                <Github className="h-4 w-4" />
                Ver no GitHub
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-body text-xs font-medium text-white transition-colors hover:bg-primary-dark"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Demo
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

ProjectCard.displayName = 'ProjectCard'

const highlightsDef = [
  { key: 'projects', label: 'Projetos pessoais', icon: Code, corner: 'from-accent to-primary', bg: 'bg-accent/20', color: 'text-accent' },
  { key: 'repos', label: 'Repos no GitHub', icon: FolderGit2, corner: 'from-green to-green/60', bg: 'bg-green/20', color: 'text-green' },
  { key: 'ia', label: 'Projetos com IA', icon: Cpu, corner: 'from-yellow to-yellow/60', bg: 'bg-yellow/20', color: 'text-yellow' },
  { key: 'techs', label: 'Tecnologias aplicadas', icon: Wrench, corner: 'from-purple to-purple/60', bg: 'bg-purple/20', color: 'text-purple' },
]

/**
 * Renders the public projects page with education section and project list.
 * Used at the /projetos route.
 */
export const ProjectsPage = memo(() => {
  const { projects, loading, error } = useProjects()
  const { stats: apiStats } = useStats()
  const [educations, setEducations] = useState<EducationItem[]>([])

  useEffect(() => {
    void fetchEducation().then(setEducations).catch(() => undefined)
  }, [])

  const pageConfig = apiStats.pageConfig
  const highlightValues: Record<string, string> = {
    projects: String(apiStats.projects.totalProjects),
    repos: String(apiStats.projects.githubRepos),
    ia: String(apiStats.projects.projectsWithIA),
    techs: String(apiStats.projects.totalTechnologies) + '+',
  }

  return (
    <div className="relative min-h-screen bg-background text-white flex flex-col">
      <PageBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16 flex-1">
        {/* Hero */}
        <section className="container text-center mb-16">
          <h1 className="font-header text-4xl font-bold uppercase text-primary sm:text-5xl lg:text-6xl">
            {pageConfig?.projectsPageTitle || 'Projetos Pessoais & Formação'}
          </h1>
          {(pageConfig?.projectsPageSubtitle) && (
            <p className="mx-auto mt-4 max-w-3xl font-body text-lg text-grey-20">
              {pageConfig.projectsPageSubtitle}
            </p>
          )}

          {/* GitHub call-to-action */}
          {pageConfig?.projectsGithubUrl && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <a
                href={pageConfig.projectsGithubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-3 font-header text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-dark"
              >
                <Github className="h-5 w-5" />
                {pageConfig.projectsGithubLabel || 'Ver meu GitHub'}
              </a>
              {pageConfig.projectsGithubHint && (
                <p className="font-body text-xs text-grey-20">
                  {pageConfig.projectsGithubHint}
                </p>
              )}
            </div>
          )}

          {/* Highlight stats grid */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {highlightsDef.map((s) => (
              <HighlightCard
                key={s.key}
                value={highlightValues[s.key] ?? '0'}
                label={s.label}
                icon={s.icon}
                cornerColor={s.corner}
                iconBg={s.bg}
                iconColor={s.color}
              />
            ))}
          </div>
        </section>

        {/* Academic education section (dynamic from backend) */}
        {educations.length > 0 && (
          <section className="relative mb-16 py-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-darker/60 via-surface/80 to-primary-dark/40" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <div className="container relative">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <h2 className="font-header text-3xl font-semibold uppercase text-primary sm:text-4xl">
                    Formação Acadêmica
                  </h2>
                </div>

                <div className="space-y-4">
                  {educations.map((edu) => {
                    const isActive = edu.status === 'in_progress'
                    return (
                      <div
                        key={edu.id}
                        className={`rounded-2xl border ${isActive ? 'border-primary/30' : 'border-white/10'} bg-background/70 backdrop-blur-sm p-6 md:p-8`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-primary/20' : 'bg-white/10'}`}>
                            <GraduationCap className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-accent-soft'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-header text-lg font-semibold text-white">{edu.title}</h3>
                              <span className={`rounded-full px-3 py-0.5 font-body text-xs font-medium ${
                                isActive
                                  ? 'bg-green/20 border border-green/30 text-green'
                                  : 'bg-white/10 border border-white/20 text-grey-30'
                              }`}>
                                {edu.period}
                              </span>
                            </div>
                            <p className={`mt-1 font-header text-sm font-medium ${isActive ? 'text-primary' : 'text-accent-soft'}`}>
                              {edu.institution}
                            </p>
                            {edu.description && (
                              <p className="mt-2 font-body text-sm text-grey-30">{edu.description}</p>
                            )}
                            {edu.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {edu.tags.map((tag) => (
                                  <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-xs text-accent-soft">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Projects list section */}
        <section className="container">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Code className="h-8 w-8 text-primary" />
              <h2 className="font-header text-3xl font-semibold uppercase text-primary sm:text-4xl">
                Projetos
              </h2>
            </div>
          </div>
          <div className="mx-auto max-w-4xl">
            {loading && (
              <div className="py-16 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 font-body text-grey-20">Carregando projetos...</p>
              </div>
            )}

            {error && !loading && (
              <div className="py-16 text-center font-body text-red">{error}</div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
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

ProjectsPage.displayName = 'ProjectsPage'
