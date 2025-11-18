import { memo } from 'react'
import type { Project } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'
import { SectionTitle } from '@/components/SectionTitle'

type FeaturedProjectsProps = {
  projects: Project[]
}

export const FeaturedProjects = memo(({ projects }: FeaturedProjectsProps) => {
  if (!projects.length) return null

  return (
    <section className="bg-[#1a1a1a]/30 border-t border-b border-white/5 py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <SectionTitle
          title="Projetos em Destaque"
          subtitle="Casos completos em produção, com pipelines de ML, APIs documentadas e deploy contínuo."
          center
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
})

FeaturedProjects.displayName = 'FeaturedProjects'
