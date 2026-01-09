import { memo, useState } from 'react'
import type { Project, SectionContent } from '@/types'
import { SectionTitle } from './SectionTitle'
import { ProjectCard } from './ProjectCard'
import { ImageModal } from './ImageModal'

type ProjectGalleryProps = {
  projects: Project[]
  heading?: SectionContent
}

const DEFAULT_HEADING: SectionContent = {
  title: 'Projetos em Destaque',
  subtitle: 'Sistemas que resolvem problemas reais com arquitetura sólida e código limpo',
}

export const ProjectGallery = memo(({ projects, heading = DEFAULT_HEADING }: ProjectGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modalImage, setModalImage] = useState<string | null>(null)

  if (!projects.length) return null

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const goToProject = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageClick = (imageUrl: string) => {
    setModalImage(imageUrl)
  }

  const closeModal = () => {
    setModalImage(null)
  }

  return (
    <section id="projects" className="py-20 px-6 bg-[#0a0a0a]">
      <div className="container mx-auto max-w-6xl">
        <SectionTitle title={heading.title} subtitle={heading.subtitle} center />

        {/* Carousel Container */}
        <div className="relative mt-12">
          {/* Navigation Arrows - Outside the card */}
          {projects.length > 1 && (
            <>
              <button
                onClick={prevProject}
                className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 bg-[#2658BD]/80 hover:bg-[#2658BD] text-white p-3 rounded-full transition-all shadow-lg"
                aria-label="Projeto anterior"
              >
                <i className="bx bx-chevron-left text-2xl" />
              </button>
              <button
                onClick={nextProject}
                className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 bg-[#2658BD]/80 hover:bg-[#2658BD] text-white p-3 rounded-full transition-all shadow-lg"
                aria-label="Próximo projeto"
              >
                <i className="bx bx-chevron-right text-2xl" />
              </button>
            </>
          )}

          {/* Project Cards Carousel */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {projects.map((project) => (
                <div key={project.id} className="min-w-full px-4">
                  <ProjectCard project={project} onImageClick={handleImageClick} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {projects.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToProject(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-[#2658BD] w-8'
                      : 'bg-white/20 w-2 hover:bg-white/40'
                  }`}
                  aria-label={`Ir para projeto ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Project Counter */}
          {projects.length > 1 && (
            <div className="text-center mt-4 text-sm text-[#b0b0b0]">
              {currentIndex + 1} / {projects.length}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal - Outside carousel to avoid overflow issues */}
      {modalImage && (
        <ImageModal
          imageUrl={modalImage}
          alt="Screenshot do projeto"
          isOpen={!!modalImage}
          onClose={closeModal}
        />
      )}
    </section>
  )
})

ProjectGallery.displayName = 'ProjectGallery'
