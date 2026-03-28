/**
 * @file App.tsx
 * Landing page of the portfolio. Renders the main sections (Hero, About,
 * Services) and lazily loads ContactForm. Applies the theme on mount and
 * removes any URL hash or auto-focus on initial render.
 */

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

// Lazy-loaded sections that are not visible above the fold
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

/**
 * Renders the portfolio landing page.
 * Applies global theme, resets scroll position and removes URL hash on mount.
 */
const App = () => {
  useTheme()
  const { projects, loading, error } = useProjects()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove URL hash if present to avoid unwanted scroll-to-anchor behaviour
      if (window.location.hash) {
        const { pathname, search } = window.location
        window.history.replaceState(null, '', `${pathname}${search}`)
      }
      // Prevent automatic scroll and remove any auto-focus
      window.scrollTo({ top: 0, behavior: 'auto' })
      // Blur any element that may have received auto-focus
      if (document.activeElement && document.activeElement !== document.body) {
        ;(document.activeElement as HTMLElement).blur()
      }
      // Ensure body has no tabindex that could cause auto-focus
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

        {/* Projects moved to /projetos */}
        {/* Experience moved to /historico */}
        <Suspense fallback={<div className="container py-16 text-center text-grey-20">Carregando...</div>}>
          <LazyContactForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
