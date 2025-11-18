import { memo } from 'react'
import type { Project, SectionContent } from '@/types'
import { useUser } from '@/hooks/useUser'
import { ProjectGallery } from '@/components/ProjectGallery'

type ProjectsSectionProps = {
  projects: Project[]
}

export const ProjectsSection = memo(({ projects }: ProjectsSectionProps) => {
  const { user } = useUser()
  const heading: SectionContent | undefined = user?.sections?.projects

  if (!projects.length) {
    return null
  }

  return (
    <section id="portfolio" className="bg-secondary py-16 md:py-20">
      <ProjectGallery projects={projects} heading={heading} />
    </section>
  )
})

ProjectsSection.displayName = 'ProjectsSection'
