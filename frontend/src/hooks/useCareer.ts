/**
 * @file useCareer.ts
 * Custom hook for fetching and managing the professional career history state.
 */

import { useEffect, useState, useCallback } from 'react'
import { fetchCareer } from '@/services/api'
import type { CareerEntry } from '@/types'

/**
 * Fetches and manages the list of professional career entries.
 *
 * @returns Object with career array, loading and error states.
 */
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
      console.error('Failed to load career history:', err)
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
