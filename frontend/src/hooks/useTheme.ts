/**
 * @file useTheme.ts
 * Custom hook that applies dynamic theme overrides from the admin settings
 * by injecting a <style> element into the document head.
 */

import { useEffect, useState } from 'react'
import { fetchPublicSettings } from '@/services/api'

/** Shape of the theme configuration fetched from the public settings endpoint. */
type ThemeSettings = {
  primaryColor: string
  primaryDarkColor: string
  accentColor: string
  accentSoftColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  headerFont: string
  bodyFont: string
}

const defaults: ThemeSettings = {
  primaryColor: '#0047AB',
  primaryDarkColor: '#002D6B',
  accentColor: '#30A0FF',
  accentSoftColor: '#99C8FF',
  backgroundColor: '#121417',
  surfaceColor: '#1A1D22',
  textColor: '#ffffff',
  headerFont: 'Raleway',
  bodyFont: 'Open Sans',
}

const STYLE_ID = 'portfolio-theme'

/**
 * Applies the colours and fonts configured in the admin panel by injecting
 * a CSS overrides style block. Only runs on public pages (not admin routes).
 *
 * @returns Object with a loaded flag that is true once the theme has been applied.
 */
export const useTheme = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      setLoaded(true)
      return
    }

    const apply = async () => {
      try {
        const raw = await fetchPublicSettings()
        const t = { ...defaults, ...(raw as ThemeSettings) }

        // Only inject if settings differ from defaults
        const isCustom = Object.keys(defaults).some(
          (k) => t[k as keyof ThemeSettings] !== defaults[k as keyof ThemeSettings]
        )

        if (!isCustom) {
          setLoaded(true)
          return
        }

        // Remove old style if exists
        document.getElementById(STYLE_ID)?.remove()

        const style = document.createElement('style')
        style.id = STYLE_ID
        style.textContent = `
          /* Portfolio Theme Overrides */
          .bg-primary { background-color: ${t.primaryColor} !important; }
          .bg-primary\\/10 { background-color: ${t.primaryColor}1a !important; }
          .bg-primary\\/20 { background-color: ${t.primaryColor}33 !important; }
          .text-primary { color: ${t.primaryColor} !important; }
          .border-primary { border-color: ${t.primaryColor} !important; }
          .border-primary\\/30 { border-color: ${t.primaryColor}4d !important; }
          .hover\\:bg-primary-dark:hover { background-color: ${t.primaryDarkColor} !important; }
          .text-accent { color: ${t.accentColor} !important; }
          .text-accent-soft { color: ${t.accentSoftColor} !important; }
          .bg-accent\\/20 { background-color: ${t.accentColor}33 !important; }
          .bg-background { background-color: ${t.backgroundColor} !important; }
          .bg-surface { background-color: ${t.surfaceColor} !important; }
          .bg-surface\\/80 { background-color: ${t.surfaceColor}cc !important; }
          .bg-surface\\/90 { background-color: ${t.surfaceColor}e6 !important; }
          .font-header { font-family: '${t.headerFont}', sans-serif !important; }
          .font-body { font-family: '${t.bodyFont}', sans-serif !important; }
        `
        document.head.appendChild(style)
      } catch {
        // Keep defaults
      } finally {
        setLoaded(true)
      }
    }

    void apply()
  }, [])

  return { loaded }
}
