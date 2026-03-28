/**
 * @file PageHeader.tsx
 * Standardised page header for all admin pages.
 * Displays an optional icon, a title, an optional subtitle and an optional "Add" action button.
 */

import { FC, ReactNode } from 'react'
import { Plus } from 'lucide-react'

/** Props for the PageHeader component. */
type PageHeaderProps = {
  title: string
  subtitle?: string
  onAdd?: () => void
  addLabel?: string
  icon?: ReactNode
}

/**
 * Renders the standardised admin page header.
 * When `onAdd` is provided an action button is shown on the right side.
 */
export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  onAdd,
  addLabel = 'Adicionar',
  icon,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div className="flex items-center gap-3">
      {icon && <div className="p-2.5 bg-primary/20 rounded-xl text-accent">{icon}</div>}
      <div>
        <h2 className="font-header text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-grey-20 text-sm font-body">{subtitle}</p>}
      </div>
    </div>
    {onAdd && (
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-body font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-primary/20"
      >
        <Plus size={16} />
        {addLabel}
      </button>
    )}
  </div>
)
