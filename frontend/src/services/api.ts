/**
 * @file api.ts
 * Centralised API client for the portfolio backend.
 * Exports typed fetch helpers for all public and admin endpoints,
 * plus token management utilities (set / get / clear).
 */

import type { ContactPayload, Project, User, About, Contact, ExperienceItem, Service, CareerEntry, StackDetail } from '@/types'

/** Represents a project or stack category returned by the admin API. */
export type AdminCategory = {
  id: string
  name: string
  slug: string
  color: string
}

/** Paginated result returned by the filtered projects admin endpoint. */
export type FilteredProjectsResult = {
  data: (Project & { order?: number })[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Resolves the API base URL depending on the current environment.
 * Uses the VITE_API_URL env var in development and the current origin in production.
 */
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

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

/** In-memory cache of the current auth token. */
let authToken: string | null = null

/**
 * Persists the JWT auth token in memory and localStorage.
 *
 * @param token - The JWT string received after a successful login.
 */
export const setAuthToken = (token: string): void => {
  authToken = token
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio_token', token)
  }
}

/**
 * Retrieves the current auth token from memory or localStorage.
 *
 * @returns The stored JWT string, or null if not authenticated.
 */
export const getAuthToken = (): string | null => {
  if (authToken) return authToken
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('portfolio_token')
  }
  return authToken
}

/**
 * Removes the auth token from memory and localStorage, effectively logging out.
 */
export const clearAuthToken = (): void => {
  authToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('portfolio_token')
  }
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Parses a fetch Response as JSON, throwing on non-2xx status.
 * Redirects to /admin/login on 401 when inside the admin area.
 *
 * @param response - The raw fetch Response object.
 * @returns The parsed JSON body typed as T.
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken()
      // Redirect to login when the user is unauthenticated inside admin routes
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    const message = await response.text()
    throw new Error(message || 'Error communicating with the API')
  }
  return response.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

/**
 * Fetches all public portfolio projects.
 *
 * @returns Array of Project objects.
 */
export const fetchProjects = async (): Promise<Project[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/projects`, { headers })
  return handleResponse<Project[]>(response)
}

/**
 * Submits a contact form message to the backend.
 *
 * @param payload - Name, email and message from the contact form.
 */
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

/**
 * Fetches the portfolio owner's public profile data.
 *
 * @returns User object with name, bio, social links, etc.
 */
export const fetchUser = async (): Promise<User> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/user`, { headers })
  return handleResponse<User>(response)
}

/** Fetches the "About" section content. */
export const fetchAbout = async (): Promise<About> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/about`, { headers })
  return handleResponse<About>(response)
}

/** Fetches the contact section info (title, subtitle, contact channels). */
export const fetchContact = async (): Promise<Contact> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/contact/info`, { headers })
  return handleResponse<Contact>(response)
}

/** Fetches professional experience items for the public timeline. */
export const fetchExperience = async (): Promise<ExperienceItem[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/experience`, { headers })
  return handleResponse<ExperienceItem[]>(response)
}

/** Fetches the list of services / specialities. */
export const fetchServices = async (): Promise<Service[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()

  const response = await fetch(`${apiBase}/api/services`, { headers })
  return handleResponse<Service[]>(response)
}

/** Fetches aggregated public statistics (counts, years, etc.) for all sections. */
export const fetchPublicStats = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/stats/public`)
  return handleResponse<unknown>(response)
}

/** Represents an education / training record. */
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

/** Fetches the list of education / training items. */
export const fetchEducation = async (): Promise<EducationItem[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/education`)
  return handleResponse<EducationItem[]>(response)
}

/** Fetches all professional career entries for the public timeline. */
export const fetchCareer = async (): Promise<CareerEntry[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/career`)
  return handleResponse<CareerEntry[]>(response)
}

/** Fetches all technology stacks for the public stacks page. */
export const fetchStacks = async (): Promise<StackDetail[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/stacks`)
  return handleResponse<StackDetail[]>(response)
}

// ---------------------------------------------------------------------------
// Admin: Projects
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated, filtered list of projects for the admin panel.
 *
 * @param params - Filter, sort and pagination options.
 * @returns Paginated result with project data and totals.
 */
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

/** Fetches all projects for admin use (no pagination). */
export const fetchAdminProjects = async (): Promise<Project[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/projects`, { headers })
  return handleResponse<Project[]>(response)
}

/**
 * Creates a new project.
 *
 * @param payload - Project fields to create.
 */
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

/**
 * Updates an existing project by ID.
 *
 * @param id - The project ID.
 * @param payload - Fields to update.
 */
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

/**
 * Deletes a project by ID.
 *
 * @param id - The project ID to delete.
 */
export const deleteProject = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/projects/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

/**
 * Generic helper for server-side filtered / paginated admin endpoints.
 *
 * @param path - API path (e.g. "/api/career/admin").
 * @param params - Key-value filter and pagination parameters.
 * @returns Paginated result with typed data array.
 */
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

/** Fetches a filtered, paginated list of career entries for the admin panel. */
export const fetchFilteredCareer = (params: { search?: string; domains?: string; contractType?: string; noStacks?: boolean; noDomains?: boolean; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<CareerEntry>('/api/career/admin', params)

/** Fetches a filtered, paginated list of stacks for the admin panel. */
export const fetchFilteredStacks = (params: { search?: string; category?: string; level?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<StackDetail>('/api/stacks/admin', params)

/** Fetches a filtered, paginated list of services for the admin panel. */
export const fetchFilteredServices = (params: { search?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<Service>('/api/services/admin', params)

/** Fetches a filtered, paginated list of contact entries for the admin panel. */
export const fetchFilteredContacts = (params: { search?: string; type?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
  fetchFiltered<unknown>('/api/contact/admin/list', params)

// ---------------------------------------------------------------------------
// Admin: Career
// ---------------------------------------------------------------------------

/** Fetches all career entries for admin use (no pagination). */
export const fetchAdminCareer = async (): Promise<CareerEntry[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/career`, { headers })
  return handleResponse<CareerEntry[]>(response)
}

/** Creates a new career entry. */
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

/** Updates an existing career entry by ID. */
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

/** Deletes a career entry by ID. */
export const deleteCareerEntry = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/career/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// ---------------------------------------------------------------------------
// Admin: Stacks
// ---------------------------------------------------------------------------

/** Fetches all stacks for admin use (no pagination). */
export const fetchAdminStacks = async (): Promise<StackDetail[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/stacks`, { headers })
  return handleResponse<StackDetail[]>(response)
}

/** Creates a new technology stack entry. */
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

/** Updates an existing stack entry by ID. */
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

/** Deletes a stack entry by ID. */
export const deleteStack = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/stacks/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// ---------------------------------------------------------------------------
// Admin: Services
// ---------------------------------------------------------------------------

/** Fetches all service entries for admin use. */
export const fetchAdminServices = async (): Promise<Service[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/services`, { headers })
  return handleResponse<Service[]>(response)
}

/** Creates a new service entry. */
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

/** Updates a service entry by ID. */
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

/** Deletes a service entry by ID. */
export const deleteService = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/services/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// ---------------------------------------------------------------------------
// Admin: Categories
// ---------------------------------------------------------------------------

/** Fetches all project/stack categories for admin use. */
export const fetchAdminCategories = async (): Promise<AdminCategory[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/categories`, { headers })
  return handleResponse<AdminCategory[]>(response)
}

// ---------------------------------------------------------------------------
// Admin: Domains
// ---------------------------------------------------------------------------

/** Fetches all business domain entries for admin use. */
export const fetchAdminDomains = async (): Promise<AdminCategory[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/domains`, { headers })
  return handleResponse<AdminCategory[]>(response)
}

/** Creates a new category. */
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

/** Updates a category by ID. */
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

/** Deletes a category by ID. */
export const deleteCategory = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/categories/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// ---------------------------------------------------------------------------
// Admin: Contacts
// ---------------------------------------------------------------------------

/** Fetches all configured contact channels for admin use. */
export const fetchAdminContacts = async (): Promise<unknown[]> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/contact/admin`, { headers })
  const data = await handleResponse<{ info: unknown[] }>(response)
  return data.info ?? []
}

/** Creates a new contact channel entry. */
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

/** Updates a contact channel entry by ID. */
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

/** Deletes a contact channel entry by ID. */
export const deleteContact = async (id: string): Promise<void> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/contact/info/${id}`, {
    method: 'DELETE',
    headers,
  })
  await handleResponse<unknown>(response)
}

// ---------------------------------------------------------------------------
// Admin: Profile & Settings
// ---------------------------------------------------------------------------

/** Fetches the full admin profile data. */
export const fetchAdminProfile = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/profile`, { headers })
  return handleResponse<unknown>(response)
}

/** Fetches admin-accessible site settings. */
export const fetchSettings = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/settings`, { headers })
  return handleResponse<unknown>(response)
}

/** Fetches publicly accessible site settings (theme colours, fonts, etc.). */
export const fetchPublicSettings = async (): Promise<unknown> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/settings/public`)
  return handleResponse<unknown>(response)
}

/**
 * Triggers a test email to verify SMTP configuration.
 *
 * @returns Object with success flag and optional message/error.
 */
export const testEmail = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  const apiBase = getApiBase()
  const headers = await getAuthHeaders()
  const response = await fetch(`${apiBase}/api/settings/test-email`, {
    method: 'POST',
    headers,
  })
  return handleResponse<{ success: boolean; message?: string; error?: string }>(response)
}

/** Updates site settings. */
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

/**
 * Uploads a static asset file (image, etc.) to the server.
 *
 * @param file - The File object to upload.
 * @returns Object with the resulting asset URL.
 */
export const uploadAsset = async (file: File, tag = 'avatar'): Promise<{ url: string }> => {
  const apiBase = getApiBase()
  const token = getAuthToken()
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${apiBase}/api/assets/upload?tag=${tag}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return handleResponse<{ url: string }>(response)
}

/** Updates the portfolio owner profile. */
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
