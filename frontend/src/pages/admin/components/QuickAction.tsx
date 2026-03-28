/**
 * @file QuickAction.tsx
 * Quick-access action card for the admin dashboard.
 * Renders as a clickable tile with an icon and a label that navigates to a given route.
 */

import { FC } from 'react'
import { Link } from 'react-router-dom'

/** Props for the QuickAction component. */
type QuickActionProps = {
  label: string
  path: string
  icon: FC<{ size?: number; className?: string }>
  /** Icon background colour class, e.g. "bg-blue-500/20". */
  iconBg?: string
  /** Icon text colour class, e.g. "text-blue-400". */
  iconColor?: string
}

/**
 * Renders a quick-action card as a React Router `<Link>` tile.
 * Used in the admin dashboard's "Quick Actions" section for common navigation shortcuts.
 */
export const QuickAction: FC<QuickActionProps> = ({
  label,
  path,
  icon: Icon,
  iconBg = 'bg-primary/20',
  iconColor = 'text-accent',
}) => (
  <Link
    to={path}
    className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-surface hover:border-primary/30 hover:shadow-lg transition-all group"
  >
    <div className={`${iconBg} rounded-lg p-2.5`}>
      <Icon size={18} className={iconColor} />
    </div>
    <span className="font-body text-sm font-medium text-grey-30 group-hover:text-white transition-colors">
      {label}
    </span>
  </Link>
)
