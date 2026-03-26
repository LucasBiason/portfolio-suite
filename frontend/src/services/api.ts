import type { ContactPayload, Project, User, About, Contact, ExperienceItem, Service, CareerEntry, StackDetail } from '@/types'

export type AdminCategory = {
  id: string
  name: string
  slug: string
  color: string
}

export type FilteredProjectsResult = {
  data: (Project & { order?: number })[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const getApiBase = (): string => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_URL || ''
  }
  
  // Development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }

  // Production: always use same domain with /api path
  // Never use api.lucasbiason.com subdomain
  return window.location.origin
}

// Token management
let authToken: string | null = null

export const setAuthToken = (token: string): void => {
  authToken = token
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio_token', token)
  }
}

export const getAuthToken = (): string | null => {
  if (authToken) return authToken
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('portfolio_token')
  }
  return authToken
}

export const clearAuthToken = (): void => {
  authToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('portfolio_token')
  }
}

// Auto-login on first load
let loginPromise: Promise<string> | null = null

const autoLogin = async (): Promise<string> => {
  if (loginPromise) return loginPromise

  loginPromise = (async () => {
    const apiBase = getApiBase()
    const email = import.meta.env.VITE_DEFAULT_EMAIL || 'lucas.biason@foxcodesoftware.com'
    const password = import.meta.env.VITE_DEFAULT_PASSWORD || 'Portfolio2025Secure!'

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Login failed:', response.status, errorText)
        throw new Error(`Login failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      const token = data.token || data.accessToken
      if (token) {
        setAuthToken(token)
        return token
      }
      throw new Error('No token received')
    } catch (error) {
      console.error('Auto-login failed:', error)
      // Don't throw - allow requests to continue (they'll get 401 and show error)
      throw error
    }
  })()

  return loginPromise
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  let token = getAuthToken()
  if (!token) {
    try {
      token = await autoLogin()
    } catch {
      // If auto-login fails, continue without token (will fail with 401)
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    // If 401, try to re-login once
    if (response.status === 401) {
      clearAuthToken()
      const token = await autoLogin()
      if (token) {
        // Retry the request (caller should handle this)
        throw new Error('RETRY_AUTH')
      }
    }
    const message = await response.text()
    throw new Error(message || 'Erro ao comunicar com a API')
  }
  return response.json() as Promise<T>
}

export const fetchProjects = async (): Promise<Project[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/projects`, { headers })
  return handleResponse<Project[]>(response)
}

export const sendContactMessage = async (payload: ContactPayload): Promise<void> => {
  const apiBase = getApiBase()

  const response = await fetch(`${apiBase}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  await handleResponse<{ success: boolean }>(response)
}

export const fetchUser = async (): Promise<User> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/user`, { headers })
  return handleResponse<User>(response)
}

export const fetchAbout = async (): Promise<About> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/about`, { headers })
  return handleResponse<About>(response)
}

export const fetchContact = async (): Promise<Contact> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/contact/info`, { headers })
  return handleResponse<Contact>(response)
}

export const fetchExperience = async (): Promise<ExperienceItem[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/experience`, { headers })
  return handleResponse<ExperienceItem[]>(response)
}

export const fetchServices = async (): Promise<Service[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/services`, { headers })
  return handleResponse<Service[]>(response)
}

export const fetchPublicStats = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/stats/public`)
  return handleResponse<unknown>(response)
}

export type EducationItem = {
  id: string
  title: string
  institution: string
  period: string
  description: string | null
  status: string
  tags: string[]
  order: number
}

export const fetchEducation = async (): Promise<EducationItem[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/education`)
  return handleResponse<EducationItem[]>(response)
}

export const fetchCareer = async (): Promise<CareerEntry[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/career`)
  return handleResponse<CareerEntry[]>(response)
}

export const fetchStacks = async (): Promise<StackDetail[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/stacks`)
  return handleResponse<StackDetail[]>(response)
}

// --- Admin: Projects ---

export const fetchFilteredProjects = async (params: {
  search?: string
  categories?: string
  featured?: string
  stacks?: string
  noGithub?: boolean
  noImages?: boolean
  noStacks?: boolean
  noCategories?: boolean
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: string
}): Promise<FilteredProjectsResult> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.categories) query.set('categories', params.categories)
  if (params.featured) query.set('featured', params.featured)
  if (params.stacks) query.set('stacks', params.stacks)
  if (params.noGithub) query.set('noGithub', 'true')
  if (params.noImages) query.set('noImages', 'true')
  if (params.noStacks) query.set('noStacks', 'true')
  if (params.noCategories) query.set('noCategories', 'true')
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDir) query.set('sortDir', params.sortDir)
  const response = await fetch(`${apiBase}/api/projects/admin?${query}`, { headers })
  return handleResponse<FilteredProjectsResult>(response)
}

export const fetchAdminProjects = async (): Promise<Project[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/projects`, { headers })
  return handleResponse<Project[]>(response)
}

export const createProject = async (payload: unknown): Promise<Project> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<Project>(response)
}

export const updateProject = async (id: string, payload: unknown): Promise<Project> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/projects/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<Project>(response)
}

export const deleteProject = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/projects/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// Generic filtered fetch helper
const fetchFiltered = async <T>(path: string, params: Record<string, string | number | boolean | undefined>): Promise<{ data: T[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') query.set(k, String(v))
  }
  const response = await fetch(`${apiBase}${path}?${query}`, { headers })
  return handleResponse(response)
}

export const fetchFilteredCareer = (params: { search?: string; domains?: string; contractType?: string; noStacks?: boolean; noDomains?: boolean; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<CareerEntry>('/api/career/admin', params)

export const fetchFilteredStacks = (params: { search?: string; category?: string; level?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<StackDetail>('/api/stacks/admin', params)

export const fetchFilteredServices = (params: { search?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<Service>('/api/services/admin', params)

export const fetchFilteredContacts = (params: { search?: string; type?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<unknown>('/api/contact/admin/list', params)

// --- Admin: Career ---

export const fetchAdminCareer = async (): Promise<CareerEntry[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/career`, { headers })
  return handleResponse<CareerEntry[]>(response)
}

export const createCareerEntry = async (payload: unknown): Promise<CareerEntry> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/career`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<CareerEntry>(response)
}

export const updateCareerEntry = async (id: string, payload: unknown): Promise<CareerEntry> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/career/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<CareerEntry>(response)
}

export const deleteCareerEntry = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/career/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// --- Admin: Stacks ---

export const fetchAdminStacks = async (): Promise<StackDetail[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/stacks`, { headers })
  return handleResponse<StackDetail[]>(response)
}

export const createStack = async (payload: unknown): Promise<StackDetail> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/stacks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<StackDetail>(response)
}

export const updateStack = async (id: string, payload: unknown): Promise<StackDetail> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/stacks/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<StackDetail>(response)
}

export const deleteStack = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/stacks/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// --- Admin: Services ---

export const fetchAdminServices = async (): Promise<Service[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/services`, { headers })
  return handleResponse<Service[]>(response)
}

export const createService = async (payload: unknown): Promise<Service> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/services`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<Service>(response)
}

export const updateService = async (id: string, payload: unknown): Promise<Service> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/services/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<Service>(response)
}

export const deleteService = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/services/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// --- Admin: Categories ---

export const fetchAdminCategories = async (): Promise<AdminCategory[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/categories`, { headers })
  return handleResponse<AdminCategory[]>(response)
}

// --- Admin: Domains ---

export const fetchAdminDomains = async (): Promise<AdminCategory[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/domains`, { headers })
  return handleResponse<AdminCategory[]>(response)
}

export const createCategory = async (payload: unknown): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<unknown>(response)
}

export const updateCategory = async (id: string, payload: unknown): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/categories/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<unknown>(response)
}

export const deleteCategory = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/categories/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// --- Admin: Contacts ---

export const fetchAdminContacts = async (): Promise<unknown[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/contact/admin`, { headers })
  const data = await handleResponse<{ info: unknown[] }>(response)
  return data.info ?? []
}

export const createContact = async (payload: unknown): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/contact/info`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<unknown>(response)
}

export const updateContact = async (id: string, payload: unknown): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/contact/info/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<unknown>(response)
}

export const deleteContact = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/contact/info/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// --- Admin: Profile ---

export const fetchAdminProfile = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/profile`, { headers })
  return handleResponse<unknown>(response)
}

export const fetchSettings = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/settings`, { headers })
  return handleResponse<unknown>(response)
}

export const fetchPublicSettings = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/settings/public`)
  return handleResponse<unknown>(response)
}

export const testEmail = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/settings/test-email`, {
    method: 'POST',
    headers,
  })
  return handleResponse<{ success: boolean; message?: string; error?: string }>(response)
}

export const updateSettings = async (payload: unknown): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/settings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<unknown>(response)
}

export const uploadAsset = async (file: File): Promise<{ url: string }> => {
  const apiBase = getApiBase()
  const token = getAuthToken()
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${apiBase}/api/assets/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return handleResponse<{ url: string }>(response)
}

export const updateProfile = async (payload: unknown): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  return handleResponse<unknown>(response)
}
