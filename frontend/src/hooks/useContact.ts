import { useEffect, useState, useCallback } from 'react'
import { fetchContact } from '@/services/api'
import type { Contact } from '@/types'

export const useContact = () => {
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadContact = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const contactData = await fetchContact()
      setContact(contactData)
    } catch (err) {
      console.error('Erro ao carregar informações de contato:', err)
      setError('Não foi possível carregar informações de contato.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContact()
  }, [loadContact])

  return { contact, loading, error }
}


