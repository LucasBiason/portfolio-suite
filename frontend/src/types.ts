/**
 * @file types.ts
 * Central TypeScript type definitions for the portfolio domain model.
 * All API response shapes and UI-facing data structures are declared here.
 */

/** Possible category values for a project displayed in the showcase. */
export type ProjectCategory = 'ml' | 'api' | 'fullstack' | 'other'

/** Represents an image associated with a project. */
export type ProjectImage = {
  id: string
  url: string
  alt: string | null
  order: number
}

/** Represents the relationship between a project and a category. */
export type ProjectCategoryRelation = {
  category: {
    id: string
    name: string
    slug: string
    color?: string
  }
}

/** Represents the relationship between a project and a stack. */
export type ProjectStackRelation = {
  stackDetail: {
    id: string
    name: string
    category: StackCategory
  }
}

/** Represents a portfolio project returned by the API. */
export type Project = {
  id: string
  title: string
  description: string
  longDescription?: string
  technologies: string[]
  githubUrl?: string
  demoUrl?: string
  imageUrl?: string | string[]
  images?: ProjectImage[]
  categories?: ProjectCategoryRelation[]
  stacks?: ProjectStackRelation[]
  category: ProjectCategory
  categoryLabel?: string
  featured: boolean
}

/** Payload submitted by the contact form. */
export type ContactPayload = {
  name: string
  email: string
  message: string
}

/** Content block for a named section (title, subtitle, description). */
export type SectionContent = {
  title: string
  subtitle: string
  description?: string
}

/** Map of configurable page sections. */
export type Sections = {
  projects?: SectionContent
}

/** Configurable content for the site footer. */
export type FooterContent = {
  title?: string
  description?: string
  tagline?: string
}

/** Global information about the portfolio owner. */
export type User = {
  name: string
  title: string
  subtitle: string
  bio: string
  avatarUrl: string
  heroBackgroundUrl: string
  socialLinks: SocialLink[]
  seo?: SeoMetadata
  sections?: Sections
  footer?: FooterContent
}

/** Social link displayed in the header and footer. */
export type SocialLink = {
  icon: string
  url: string
  label: string
}

/** Dynamic SEO metadata (page title and meta description). */
export type SeoMetadata = {
  title?: string
  description?: string
}

/** Content for the "About" section. */
export type About = {
  title: string
  subtitle: string
  description: string
  description2: string
  highlights: string[]
}

/** A contact channel card (e.g. email, WhatsApp). */
export type ContactInfo = {
  icon: string
  title: string
  value: string
  href: string | null
}

/** Full content block for the contact section. */
export type Contact = {
  title: string
  subtitle: string
  description: string
  info: ContactInfo[]
}

/** A professional experience item displayed on the timeline. */
export type ExperienceItem = {
  company: string
  role: string
  period: string
  summary: string
}

/** A service / speciality shown in the "Services" section. */
export type Service = {
  title: string
  description: string
  icon: string
}

/** Stack item linked to a career entry. */
export type CareerStackItem = {
  id: string
  stackDetail: {
    id: string
    name: string
    category: StackCategory
  }
}

/** Business domain item linked to a career entry. */
export type CareerDomainItem = {
  id: string
  domain: {
    id: string
    name: string
    slug: string
    color?: string
  }
}

/** A single entry in the professional history timeline. */
export type CareerEntry = {
  id: string
  company: string
  role: string
  contractType: string
  startDate: string
  endDate: string | null
  summary: string
  projectTypes: string[]
  actions: string[]
  stacks: CareerStackItem[]
  domains: CareerDomainItem[]
}

/** Category associated with a technology stack. */
export type StackCategory = {
  id: string
  name: string
  slug: string
  color?: string
  icon?: string
}

/** Detailed information about a technology / stack entry. */
export type StackDetail = {
  id: string
  name: string
  categoryId: string
  category: StackCategory
  startYear: number
  endYear: number | null
  level: string
  icon: string | null
  profProjects: string[]
  personalProjects: string[]
  solutions: string[]
  patterns: string[]
  order?: number
}
