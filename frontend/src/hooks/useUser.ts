import { useEffect, useState, useCallback } from 'react'
import { fetchUser } from '@/services/api'
import type { User } from '@/types'

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await fetchUser()
      setUser(userData)
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err)
      setError('Não foi possível carregar informações do usuário.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return { user, loading, error }
}


