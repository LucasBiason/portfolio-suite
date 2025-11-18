import { useEffect, useMemo, useState, useCallback } from 'react'
import { fetchProjects } from '@/services/api'
import type { Project } from '@/types'

type UseProjectsResult = {
  projects: Project[];
  featured: Project[];
  loading: boolean;
  error: string | null;
};

export const useProjects = (): UseProjectsResult => {
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const projectsResponse = await fetchProjects()
      setData(projectsResponse)
    } catch (err) {
      console.error('Erro ao carregar projetos:', err)
      setError('Não foi possível carregar os projetos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const featured = useMemo(() => data.filter((project) => project.featured), [data])

  return { projects: data, featured, loading, error }
}
