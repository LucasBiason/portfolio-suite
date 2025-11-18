import { memo } from 'react'
import { useServices } from '@/hooks/useServices'

export const ServicesSection = memo(() => {
  const { services, loading } = useServices()

  if (loading || !services.length) {
    return (
      <section id="servicos" className="container py-16 md:py-20">
        <div className="text-center">
          <p className="font-body text-grey-20">Carregando serviços...</p>
        </div>
      </section>
    )
  }
  return (
    <section id="servicos" className="container py-16 md:py-20">
      <h2 className="text-center font-header text-4xl font-semibold uppercase text-primary sm:text-5xl lg:text-6xl">
        Especialidades
      </h2>
      <h3 className="pt-6 text-center font-header text-xl font-medium text-white sm:text-2xl lg:text-3xl">
        Serviços que já entreguei ao longo da carreira
      </h3>
      <div className="grid grid-cols-1 gap-6 pt-12 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="group rounded-xl border border-white/5 bg-background/80 px-8 py-12 text-center shadow transition-transform hover:-translate-y-1 hover:border-primary"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-center transition-colors group-hover:bg-primary">
              <i className={`bx ${service.icon} text-4xl text-accent transition-colors group-hover:text-white`} />
            </div>
            <h3 className="pt-6 text-lg font-semibold uppercase text-accent group-hover:text-white lg:text-xl">
              {service.title}
            </h3>
            <p className="pt-4 text-sm text-grey-20 group-hover:text-grey-40 md:text-base">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
})

ServicesSection.displayName = 'ServicesSection'
