import { useEffect, Suspense, lazy } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { AboutSection } from '@/components/AboutSection'
import { ServicesSection } from '@/components/ServicesSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { ExperienceSection } from '@/components/ExperienceSection'
import { ContactForm } from '@/components/ContactForm'
import { Footer } from '@/components/Footer'
import { useProjects } from '@/hooks/useProjects'

// Lazy loading para seções menos críticas
const LazyExperienceSection = lazy(() =>
  import('@/components/ExperienceSection').then((module) => ({
    default: module.ExperienceSection,
  }))
)

const LazyContactForm = lazy(() =>
  import('@/components/ContactForm').then((module) => ({
    default: module.ContactForm,
  }))
)

const App = () => {
  useTheme()
  const { projects, loading, error } = useProjects()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove hash da URL se existir
      if (window.location.hash) {
        const { pathname, search } = window.location
        window.history.replaceState(null, '', `${pathname}${search}`)
      }
      // Previne scroll automático e remove qualquer foco automático
      window.scrollTo({ top: 0, behavior: 'auto' })
      // Remove foco de qualquer elemento que possa ter recebido auto-focus
      if (document.activeElement && document.activeElement !== document.body) {
        ;(document.activeElement as HTMLElement).blur()
      }
      // Garante que o body não tenha tabindex que cause auto-focus
      document.body.removeAttribute('tabindex')
    }
  }, [])

  return (
    <div className="min-h-screen bg-secondary text-white">
      <Header />
      <main className="pt-4 sm:pt-6">
        <Hero />
        <AboutSection />
        <ServicesSection />

        {/* Projetos movidos para /projetos */}
        {/* Experiência movida para /historico */}
        <Suspense fallback={<div className="container py-16 text-center text-grey-20">Carregando...</div>}>
          <LazyContactForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
