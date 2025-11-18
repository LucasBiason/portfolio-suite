import { useEffect, useState, useCallback } from 'react'
import { fetchAbout } from '@/services/api'
import type { About } from '@/types'

export const useAbout = () => {
  const [about, setAbout] = useState<About | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadAbout = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const aboutData = await fetchAbout()
      setAbout(aboutData)
    } catch (err) {
      console.error('Erro ao carregar informações sobre:', err)
      setError('Não foi possível carregar informações sobre.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAbout()
  }, [loadAbout])

  return { about, loading, error }
}


