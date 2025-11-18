import { useEffect, useState, useCallback } from 'react'
import { fetchServices } from '@/services/api'
import type { Service } from '@/types'

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const servicesData = await fetchServices()
      setServices(servicesData)
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
      setError('Não foi possível carregar serviços.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  return { services, loading, error }
}


