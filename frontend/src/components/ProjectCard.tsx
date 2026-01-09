import { memo } from 'react'
import type { Project } from '@/types'
import { ImageCarousel } from './ImageCarousel'

type ProjectCardProps = {
  project: Project
  onImageClick?: (imageUrl: string) => void
}

export const ProjectCard = memo(({ project, onImageClick }: ProjectCardProps) => {
  // Support both single image and array of images for carousel
  const images = project.imageUrl
    ? Array.isArray(project.imageUrl)
      ? project.imageUrl
      : [project.imageUrl]
    : []

  // Parse longDescription to extract key sections (if formatted with **)
  const parseDescription = (text: string | null | undefined): {
    what?: string
    how?: string
    differential?: string
    stack?: string
    raw?: string
  } => {
    if (!text) return { raw: project.description }

    // Se tem **O que resolve**, **Como funciona**, etc, extrai seções
    const whatMatch = text.match(/\*\*O que resolve:\*\*\s*(.+?)(?=\*\*|$)/s)
    const howMatch = text.match(/\*\*Como funciona:\*\*\s*(.+?)(?=\*\*|$)/s)
    const diffMatch = text.match(/\*\*Diferencial:\*\*\s*(.+?)(?=\*\*|$)/s)
    const stackMatch = text.match(/\*\*Stack:\*\*\s*(.+?)(?=\*\*|$)/s)

    if (whatMatch || howMatch || diffMatch || stackMatch) {
      return {
        what: whatMatch?.[1]?.trim(),
        how: howMatch?.[1]?.trim(),
        differential: diffMatch?.[1]?.trim(),
        stack: stackMatch?.[1]?.trim(),
      }
    }

    return { raw: text }
  }

  const description = parseDescription(project.longDescription ?? project.description)

  return (
    <article className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-[#2658BD]/60 transition-all hover:shadow-lg hover:shadow-[#2658BD]/10 flex flex-col">
      {/* Screenshot Carousel */}
      {images.length > 0 && (
        <div className="w-full h-48 bg-[#0a0a0a] border-b border-white/5">
          <ImageCarousel 
            images={images} 
            alt={project.title} 
            onImageClick={project.title === 'Engineering Knowledge Base' ? undefined : onImageClick} 
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Category and Featured Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 text-xs uppercase tracking-wide bg-[#2658BD]/20 text-[#2658BD] rounded-full font-medium">
            {project.categoryLabel ?? project.category}
          </span>
          {project.featured && (
            <span className="text-xs text-[#2658BD] font-semibold">Destaque</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-4">{project.title}</h3>

        {/* Description - Estruturada e escaneável */}
        <div className="mb-4 space-y-3 text-sm text-[#b0b0b0] leading-relaxed flex-1">
          {description.what && (
            <div>
              <span className="font-semibold text-white">O que resolve:</span>
              <p className="mt-1">{description.what}</p>
            </div>
          )}
          {description.how && (
            <div>
              <span className="font-semibold text-white">Como funciona:</span>
              <p className="mt-1">{description.how}</p>
            </div>
          )}
          {description.differential && (
            <div>
              <span className="font-semibold text-[#2658BD]">Diferencial:</span>
              <p className="mt-1">{description.differential}</p>
            </div>
          )}
          {description.raw && !description.what && (
            <p>{description.raw}</p>
          )}
        </div>

        {/* Stack - Compact */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <span key={tech} className="px-2 py-1 text-xs bg-white/5 text-[#b0b0b0] rounded">
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-sm pt-4 border-t border-white/5 mt-auto">
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
      </div>
    </article>
  )
})

ProjectCard.displayName = 'ProjectCard'
