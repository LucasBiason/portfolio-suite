/**
 * @file StatCard.tsx
 * Compact statistic card used in the admin dashboard.
 * Features a coloured corner gradient, an icon with coloured background,
 * a numeric value and a descriptive label. Optionally navigates to a page when clicked.
 */

import { FC } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/** Props for the StatCard component. */
type StatCardProps = {
  label: string
  value: number | string
  icon: FC<{ size?: number; className?: string }>
  cornerColor: string
  iconBg: string
  iconColor: string
  path?: string
}

/**
 * Renders a statistic card with an optional link to a detail page.
 * Wraps content in a `<Link>` when `path` is provided; otherwise renders a plain `<div>`.
 */
export const StatCard: FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  cornerColor,
  iconBg,
  iconColor,
  path,
}) => {
  const content = (
    <div className="relative bg-surface rounded-xl p-4 overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-white/5 hover:border-white/10 group">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${cornerColor} opacity-20 rounded-bl-full`} />

      <div className="relative flex items-center gap-3">
        <div className={`${iconBg} rounded-lg p-2 flex-shrink-0`}>
          <Icon size={16} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-header font-bold text-white leading-tight">{value}</p>
          <p className="text-xs font-body text-grey-20 truncate">{label}</p>
        </div>
        {path && (
          <ArrowRight size={14} className="text-grey-20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        )}
      </div>
    </div>
  )

  if (path) {
    return <Link to={path}>{content}</Link>
  }

  return content
}
