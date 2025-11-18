import { memo } from 'react'

type SectionTitleProps = {
  title: string
  subtitle?: string
  center?: boolean
}

export const SectionTitle = memo(({ title, subtitle, center = false }: SectionTitleProps) => (
  <div className={center ? 'text-center mb-12' : 'mb-12'}>
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
    {subtitle && <p className="mt-3 text-[#b0b0b0] max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
  </div>
))

SectionTitle.displayName = 'SectionTitle'
