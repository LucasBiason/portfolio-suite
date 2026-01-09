import { memo, useEffect } from 'react'

type ImageModalProps = {
  imageUrl: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export const ImageModal = memo(({ imageUrl, alt, isOpen, onClose }: ImageModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização ampliada: ${alt}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-[#2658BD]/80 hover:bg-[#2658BD] text-white p-3 rounded-full transition-all shadow-lg"
        aria-label="Fechar visualização"
      >
        <i className="bx bx-x text-2xl" />
      </button>

      {/* Image container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Click outside to close hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        Clique fora ou pressione ESC para fechar
      </div>
    </div>
  )
})

ImageModal.displayName = 'ImageModal'

