import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './index.css'

import App from './App'

const CareerPage = lazy(() =>
  import('@/pages/CareerPage').then((m) => ({ default: m.CareerPage }))
)
const StacksPage = lazy(() =>
  import('@/pages/StacksPage').then((m) => ({ default: m.StacksPage }))
)
const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
)

// Admin pages
const AdminLogin = lazy(() =>
  import('@/pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin }))
)
const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
)
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
)
const AdminProjects = lazy(() =>
  import('@/pages/admin/AdminProjects').then((m) => ({ default: m.AdminProjects }))
)
const AdminCareer = lazy(() =>
  import('@/pages/admin/AdminCareer').then((m) => ({ default: m.AdminCareer }))
)
const AdminStacks = lazy(() =>
  import('@/pages/admin/AdminStacks').then((m) => ({ default: m.AdminStacks }))
)
const AdminServices = lazy(() =>
  import('@/pages/admin/AdminServices').then((m) => ({ default: m.AdminServices }))
)
const AdminContacts = lazy(() =>
  import('@/pages/admin/AdminContacts').then((m) => ({ default: m.AdminContacts }))
)
const AdminProfile = lazy(() =>
  import('@/pages/admin/AdminProfile').then((m) => ({ default: m.AdminProfile }))
)
const AdminSettings = lazy(() =>
  import('@/pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings }))
)
const AdminCategories = lazy(() =>
  import('@/pages/admin/AdminCategories').then((m) => ({ default: m.AdminCategories }))
)
const AdminEducation = lazy(() =>
  import('@/pages/admin/AdminEducation').then((m) => ({ default: m.AdminEducation }))
)
const AdminDomains = lazy(() =>
  import('@/pages/admin/AdminDomains').then((m) => ({ default: m.AdminDomains }))
)

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      <p className="mt-4 font-body text-grey-20">Carregando...</p>
    </div>
  </div>
)

const rootElement = document.getElementById('root')
if (rootElement) {
  const loadingContent = rootElement.querySelector('div[style*="min-height: 100vh"]')
  if (loadingContent) {
    rootElement.innerHTML = ''
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/projetos" element={<ProjectsPage />} />
              <Route path="/historico" element={<CareerPage />} />
              <Route path="/stacks" element={<StacksPage />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="career" element={<AdminCareer />} />
                <Route path="stacks" element={<AdminStacks />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="education" element={<AdminEducation />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="domains" element={<AdminDomains />} />
                <Route path="contacts" element={<AdminContacts />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  )
} else {
  console.error('Root element not found!')
}
