/**
 * @file Modal.tsx
 * Generic overlay modal used across all admin pages for create/edit forms.
 * Clicking the backdrop triggers `onClose`. Supports a wider variant for complex forms.
 */

import { FC, ReactNode } from 'react'
import { X } from 'lucide-react'

/** Props for the Modal component. */
type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

/**
 * Renders a centred overlay modal with a title bar and close button.
 * Content is passed as children and rendered inside a scrollable container.
 */
export const Modal: FC<ModalProps> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
    <div className="absolute inset-0 bg-black/70" onClick={onClose} />
    <div
      className={[
        'relative bg-surface border border-white/10 rounded-xl shadow-xl w-full my-auto',
        wide ? 'max-w-2xl' : 'max-w-lg',
      ].join(' ')}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h3 className="font-header text-base font-semibold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-grey-30 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
)
