/**
 * Categorias possíveis para um projeto exibido na vitrine.
 */
export type ProjectCategory = 'ml' | 'api' | 'fullstack' | 'other'

/**
 * Estrutura base de um projeto retornado pela API.
 */
export type ProjectImage = {
  id: string
  url: string
  alt: string | null
  order: number
}

export type ProjectCategoryRelation = {
  category: {
    id: string
    name: string
    slug: string
    color?: string
  }
}

export type ProjectStackRelation = {
  stackDetail: {
    id: string
    name: string
    category: StackCategory
  }
}

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

/**
 * Payload enviado pelo formulário de contato.
 */
export type ContactPayload = {
  name: string
  email: string
  message: string
}

/**
 * Informações globais do usuário/dono do portfólio.
 */
export type SectionContent = {
  title: string
  subtitle: string
  description?: string
}

export type Sections = {
  projects?: SectionContent
}

export type FooterContent = {
  title?: string
  description?: string
  tagline?: string
}

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

/**
 * Link social exibido no cabeçalho/rodapé.
 */
export type SocialLink = {
  icon: string
  url: string
  label: string
}

/**
 * Metadados dinâmicos para SEO (title/meta description).
 */
export type SeoMetadata = {
  title?: string
  description?: string
}

/**
 * Conteúdo da seção "Sobre".
 */
export type About = {
  title: string
  subtitle: string
  description: string
  description2: string
  highlights: string[]
}

/**
 * Card de contato (ex.: email, WhatsApp).
 */
export type ContactInfo = {
  icon: string
  title: string
  value: string
  href: string | null
}

/**
 * Bloco completo da seção de contato.
 */
export type Contact = {
  title: string
  subtitle: string
  description: string
  info: ContactInfo[]
}

/**
 * Experiência profissional exibida na linha do tempo.
 */
export type ExperienceItem = {
  company: string
  role: string
  period: string
  summary: string
}

/**
 * Serviço/especialidade apresentado na seção "Especialidades".
 */
export type Service = {
  title: string
  description: string
  icon: string
}

/**
 * Stack associada a uma entrada de carreira.
 */
export type CareerStackItem = {
  id: string
  stackDetail: {
    id: string
    name: string
    category: StackCategory
  }
}

export type CareerDomainItem = {
  id: string
  domain: {
    id: string
    name: string
    slug: string
    color?: string
  }
}

/**
 * Entrada do historico profissional (timeline).
 */
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

/**
 * Categoria associada a uma stack.
 */
export type StackCategory = {
  id: string
  name: string
  slug: string
  color?: string
  icon?: string
}

/**
 * Detalhamento de uma tecnologia/stack.
 */
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
