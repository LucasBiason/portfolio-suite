/**
 * COMPONENTE: HighlightCard
 *
 * Card de destaque numerico para paginas publicas.
 * Cantinho colorido + icone circular (mesmo estilo do admin StatCard).
 */

import { FC, memo } from 'react'

type HighlightCardProps = {
  value: string | number
  label: string
  icon: FC<{ size?: number; className?: string }>
  /** Gradient corner, e.g. "from-blue-500 to-blue-700" */
  cornerColor: string
  /** Icon bg, e.g. "bg-blue-500/20" */
  iconBg: string
  /** Icon color, e.g. "text-blue-400" */
  iconColor: string
}

export const HighlightCard: FC<HighlightCardProps> = memo(({
  value,
  label,
  icon: Icon,
  cornerColor,
  iconBg,
  iconColor,
}) => (
  <div className="relative bg-surface/80 rounded-xl p-5 overflow-hidden border border-white/5">
    {/* Cantinho colorido */}
    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${cornerColor} opacity-20 rounded-bl-full`} />

    <div className="relative flex items-center gap-3">
      <div className={`${iconBg} rounded-full p-2.5 flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <p className="font-header text-2xl font-bold text-white">{value}</p>
        <p className="font-body text-xs text-grey-20">{label}</p>
      </div>
    </div>
  </div>
))

HighlightCard.displayName = 'HighlightCard'
