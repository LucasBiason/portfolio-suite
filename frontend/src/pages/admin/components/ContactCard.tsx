/**
 * COMPONENTE: ContactCard
 *
 * Card de canal de contato configurado.
 * Exibe icone, titulo e valor com estilo consistente.
 */

import { FC } from 'react'

type ContactCardProps = {
  icon: string
  title: string
  value: string
  href?: string | null
}

export const ContactCard: FC<ContactCardProps> = ({ icon, title, value, href }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-white/5">
    <div className="p-2.5 rounded-lg bg-primary/20 flex-shrink-0">
      <i className={`bx ${icon} text-xl text-accent`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-body text-xs text-grey-20 uppercase tracking-wider">{title}</p>
      {href ? (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
          className="font-body text-sm text-white hover:text-accent transition-colors truncate block"
        >
          {value}
        </a>
      ) : (
        <p className="font-body text-sm text-white truncate">{value}</p>
      )}
    </div>
  </div>
)
