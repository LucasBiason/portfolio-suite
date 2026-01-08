import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './index.css'

// Import App directly instead of lazy to avoid mobile loading issues
import App from './App'

const LoadingFallback = () => (
  <div className="min-h-screen bg-secondary flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      <p className="mt-4 font-body text-grey-20">Carregando portfólio...</p>
    </div>
  </div>
)

// Remove loading fallback from HTML when React loads
const rootElement = document.getElementById('root')
if (rootElement) {
  // Clear any loading content
  const loadingContent = rootElement.querySelector('div[style*="min-height: 100vh"]')
  if (loadingContent) {
    rootElement.innerHTML = ''
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  )
} else {
  console.error('Root element not found!')
}
