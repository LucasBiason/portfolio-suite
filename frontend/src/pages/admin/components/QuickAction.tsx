/**
 * COMPONENTE: QuickAction
 *
 * Botao de acao rapida para a dashboard.
 * Card clicavel com icone e label.
 */

import { FC } from 'react'
import { Link } from 'react-router-dom'

type QuickActionProps = {
  label: string
  path: string
  icon: FC<{ size?: number; className?: string }>
  /** Icon background color, e.g. "bg-blue-500/20" */
  iconBg?: string
  /** Icon text color, e.g. "text-blue-400" */
  iconColor?: string
}

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
