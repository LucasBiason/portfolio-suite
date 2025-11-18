import type { ContactPayload, Project, User, About, Contact, ExperienceItem, Service } from '@/types'

const getApiBase = (): string => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_URL || 'https://api.lucasbiason.com'
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }

  // In production, use the API subdomain with HTTPS
  if (window.location.hostname === 'lucasbiason.com' || window.location.hostname === 'www.lucasbiason.com') {
    return 'https://api.lucasbiason.com'
  }

  return import.meta.env.VITE_API_URL || window.location.origin
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
      })

      if (!response.ok) {
        throw new Error('Login failed')
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
