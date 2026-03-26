import { useEffect, useState, useCallback } from 'react'
import { fetchStacks } from '@/services/api'
import type { StackDetail } from '@/types'

export const useStacks = () => {
  const [stacks, setStacks] = useState<StackDetail[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadStacks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchStacks()
      setStacks(data)
    } catch (err) {
      console.error('Erro ao carregar stacks:', err)
      setError('Nao foi possivel carregar stacks.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStacks()
  }, [loadStacks])

  return { stacks, loading, error }
}
