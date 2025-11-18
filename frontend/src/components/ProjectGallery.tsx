import { memo } from 'react'
import type { Project, SectionContent } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'
import { SectionTitle } from '@/components/SectionTitle'

type ProjectGalleryProps = {
  projects: Project[]
  heading?: SectionContent
}

const DEFAULT_HEADING: SectionContent = {
  title: 'Portfólio em produção',
  subtitle: 'Projetos ativos, laboratórios e APIs mantidas no dia a dia',
}

export const ProjectGallery = memo(({ projects, heading = DEFAULT_HEADING }: ProjectGalleryProps) => (
  <section id="projects" className="py-20 px-6 bg-[#0a0a0a]">
    <div className="container mx-auto max-w-6xl">
      <SectionTitle title={heading.title} subtitle={heading.subtitle} center />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  </section>
))

ProjectGallery.displayName = 'ProjectGallery'
