import { useEffect, useState, useCallback } from 'react'
import { fetchExperience } from '@/services/api'
import type { ExperienceItem } from '@/types'

export const useExperience = () => {
  const [experience, setExperience] = useState<ExperienceItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadExperience = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const experienceData = await fetchExperience()
      setExperience(experienceData)
    } catch (err) {
      console.error('Erro ao carregar experiência profissional:', err)
      setError('Não foi possível carregar experiência profissional.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExperience()
  }, [loadExperience])

  return { experience, loading, error }
}


