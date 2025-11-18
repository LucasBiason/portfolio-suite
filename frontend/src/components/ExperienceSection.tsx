import { memo } from 'react'
import { useExperience } from '@/hooks/useExperience'

export const ExperienceSection = memo(() => {
  const { experience, loading } = useExperience()

  if (loading || !experience.length) {
    return (
      <section id="experiencia" className="container py-16 md:py-20">
        <div className="text-center">
          <p className="font-body text-grey-20">Carregando experiência profissional...</p>
        </div>
      </section>
    )
  }
  return (
    <section id="experiencia" className="container py-16 md:py-20">
      <h2 className="text-center font-header text-4xl font-semibold uppercase text-primary sm:text-5xl lg:text-6xl">
        Jornada profissional
      </h2>
      <h3 className="pt-6 text-center font-header text-xl font-medium text-white sm:text-2xl lg:text-3xl">
        Histórico das empresas em que atuei
      </h3>
      <div className="mx-auto mt-12 max-w-4xl">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 hidden w-0.5 bg-primary/30 md:block" />

          {/* Timeline items */}
          <div className="space-y-12">
            {experience.map((item) => (
              <div key={item.company} className="relative flex gap-8 md:gap-12">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary shadow-lg">
                    <i className="bx bx-briefcase-alt-2 text-2xl text-white" />
                  </div>
                  {/* Connecting line from dot to content on mobile */}
                  <div className="absolute left-8 top-8 h-0.5 w-8 bg-primary/30 md:hidden" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-12 md:pb-0">
                  <div className="rounded-2xl border border-white/5 bg-background/85 p-6 shadow-lg transition-shadow hover:shadow-xl">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="font-header text-xl font-semibold text-white">{item.role}</h4>
                      <span className="font-body text-xs uppercase tracking-wider text-accent-soft">
                        {item.period}
                      </span>
                    </div>
                    <h5 className="mb-3 font-header text-lg font-medium text-primary">{item.company}</h5>
                    <p className="font-body text-sm leading-relaxed text-grey-20">{item.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

ExperienceSection.displayName = 'ExperienceSection'
