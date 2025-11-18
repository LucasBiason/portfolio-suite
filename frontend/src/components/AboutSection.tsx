import { memo } from 'react'
import { useAbout } from '@/hooks/useAbout'

export const AboutSection = memo(() => {
  const { about, loading } = useAbout()

  if (loading || !about) {
    return (
      <section id="sobre" className="bg-surface py-16 md:py-20 lg:py-24">
        <div className="container text-center">
          <p className="font-body text-grey-20">Carregando...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="sobre" className="bg-surface py-16 md:py-20 lg:py-24">
      <div className="container grid gap-12 lg:grid-cols-[1.4fr,1fr]">
        <div className="text-center lg:text-left">
          <h2 className="font-header text-4xl font-semibold uppercase text-primary sm:text-5xl lg:text-6xl">
            {about.title}
          </h2>
          <h3 className="pt-6 font-header text-xl font-medium text-white sm:text-2xl lg:text-3xl">
            {about.subtitle}
          </h3>
          <p className="pt-6 font-body leading-relaxed text-grey-20">{about.description}</p>
          <p className="pt-4 font-body leading-relaxed text-grey-20">{about.description2}</p>
        </div>
        <div className="space-y-4">
          {about.highlights.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/5 bg-background/80 px-6 py-5 font-body text-sm text-grey-40 shadow"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

AboutSection.displayName = 'AboutSection'
