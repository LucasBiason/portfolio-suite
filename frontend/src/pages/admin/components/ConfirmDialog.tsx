/**
 * @file ConfirmDialog.tsx
 * Destructive-action confirmation dialog used before deleting records in the admin panel.
 * Blocks interaction with the rest of the UI until the user confirms or cancels.
 */

import { FC } from 'react'
import { AlertTriangle } from 'lucide-react'

/** Props for the ConfirmDialog component. */
type ConfirmDialogProps = {
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

/**
 * Renders a full-screen overlay confirmation dialog with a warning icon.
 * The confirm button is disabled while `loading` is true to prevent double-submits.
 */
export const ConfirmDialog: FC<ConfirmDialogProps> = ({ message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
    <div className="relative bg-surface border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red/20 rounded-lg">
          <AlertTriangle size={20} className="text-red" />
        </div>
        <h3 className="font-header text-base font-semibold text-white">Confirmar exclusão</h3>
      </div>
      <p className="text-grey-30 text-sm font-body mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-body font-medium text-grey-30 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-body font-medium bg-red hover:bg-red/80 disabled:opacity-50 text-white transition-colors"
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </div>
  </div>
)
