import { memo } from 'react'
import type { Project } from '@/types'

type ProjectCardProps = {
  project: Project
}

export const ProjectCard = memo(({ project }: ProjectCardProps) => (
  <article className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 hover:border-[#2658BD]/60 transition-all hover:shadow-lg hover:shadow-[#2658BD]/10">
    <div className="flex items-center justify-between mb-3">
      <span className="px-3 py-1 text-xs uppercase tracking-wide bg-[#2658BD]/20 text-[#2658BD] rounded-full font-medium">
        {project.categoryLabel ?? project.category}
      </span>
      {project.featured && (
        <span className="text-xs text-[#2658BD] font-semibold">Destaque</span>
      )}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
    <p className="text-sm text-[#b0b0b0] mb-4 leading-relaxed">{project.longDescription ?? project.description}</p>
    <div className="flex flex-wrap gap-2 mb-4">
      {project.technologies.map((tech) => (
        <span key={tech} className="px-3 py-1 text-xs bg-white/5 text-[#b0b0b0] rounded-full">
          {tech}
        </span>
      ))}
    </div>
    <div className="flex items-center gap-4 text-sm">
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[#2658BD] hover:text-[#1e4699] transition-colors font-medium"
        >
          Código →
        </a>
      )}
      {project.demoUrl && (
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[#b0b0b0] hover:text-[#2658BD] transition-colors"
        >
          Demo →
        </a>
      )}
    </div>
  </article>
))

ProjectCard.displayName = 'ProjectCard'
