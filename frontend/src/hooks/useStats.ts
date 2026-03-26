import { useEffect, useState, useCallback } from 'react'
import { fetchPublicStats } from '@/services/api'

export type PortfolioStats = {
  career: {
    totalEntries: number
    totalYears: string
    totalDomains: number
    totalPatterns: number
  }
  projects: {
    totalProjects: number
    totalTechnologies: number
    totalImages: number
    githubRepos: number
    projectsWithIA: number
  }
  stacks: {
    totalStacks: number
    totalCategories: number
    expertCount: number
    advancedCount: number
    avgYears: number
    oldestStartYear: number | null
    levelDistribution: Record<string, number>
  }
  services: { totalServices: number }
  contacts: { totalContacts: number }
  education: { totalEducations: number }
  pageConfig: {
    projectsPageTitle: string
    projectsPageSubtitle: string
    projectsGithubUrl: string
    projectsGithubLabel: string
    projectsGithubHint: string
    careerPageTitle: string
    careerPageSubtitle: string
    stacksPageTitle: string
    stacksPageSubtitle: string
  } | null
}

const emptyStats: PortfolioStats = {
  career: { totalEntries: 0, totalYears: '0', totalDomains: 0, totalPatterns: 0 },
  projects: { totalProjects: 0, totalTechnologies: 0, totalImages: 0, githubRepos: 0, projectsWithIA: 0 },
  stacks: { totalStacks: 0, totalCategories: 0, expertCount: 0, advancedCount: 0, avgYears: 0, oldestStartYear: null, levelDistribution: {} },
  services: { totalServices: 0 },
  contacts: { totalContacts: 0 },
  education: { totalEducations: 0 },
  pageConfig: null,
}

export const useStats = () => {
  const [stats, setStats] = useState<PortfolioStats>(emptyStats)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchPublicStats()
      setStats(data as PortfolioStats)
    } catch {
      // keep empty stats
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { stats, loading }
}
