import type { ContactPayload, Project, User, About, Contact, ExperienceItem, Service } from '@/types'

const getApiBase = (): string => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_URL || 'https://lucasbiason.com'
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }

  return window.location.origin
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Erro ao comunicar com a API')
  }
  return response.json() as Promise<T>
}

export const fetchProjects = async (): Promise<Project[]> => {
  const apiBase = getApiBase()

  const response = await fetch(`${apiBase}/api/projects`)
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
  const response = await fetch(`${apiBase}/api/user`)
  return handleResponse<User>(response)
}

export const fetchAbout = async (): Promise<About> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/about`)
  return handleResponse<About>(response)
}

export const fetchContact = async (): Promise<Contact> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/contact/info`)
  return handleResponse<Contact>(response)
}

export const fetchExperience = async (): Promise<ExperienceItem[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/experience`)
  return handleResponse<ExperienceItem[]>(response)
}

export const fetchServices = async (): Promise<Service[]> => {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/services`)
  return handleResponse<Service[]>(response)
}
