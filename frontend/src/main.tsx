import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './index.css'

const App = lazy(() => import('./App').then((module) => ({ default: module.default })))

const LoadingFallback = () => (
  <div className="min-h-screen bg-secondary flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      <p className="mt-4 font-body text-grey-20">Carregando portfólio...</p>
    </div>
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
