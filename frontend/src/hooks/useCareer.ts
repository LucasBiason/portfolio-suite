import { useEffect, useState, useCallback } from 'react'
import { fetchCareer } from '@/services/api'
import type { CareerEntry } from '@/types'

export const useCareer = () => {
  const [career, setCareer] = useState<CareerEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadCareer = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCareer()
      setCareer(data)
    } catch (err) {
      console.error('Erro ao carregar historico profissional:', err)
      setError('Nao foi possivel carregar historico profissional.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCareer()
  }, [loadCareer])

  return { career, loading, error }
}
