/**
 * COMPONENTE: ImageCarouselSimple
 *
 * Carrossel de imagens com controles prev/next, indicadores e fallback de erro.
 * Proporção padrao 16:9. Imagens que falham ao carregar sao ocultadas.
 */

import { useState, useCallback, useMemo, memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ImageItem = {
  url: string
  alt?: string | null
}

type ImageCarouselSimpleProps = {
  images: ImageItem[]
  className?: string
}

export const ImageCarouselSimple = memo(({ images, className = '' }: ImageCarouselSimpleProps) => {
  const [current, setCurrent] = useState(0)
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())

  // Filter out failed images
  const validImages = useMemo(
    () => images.filter((img) => !failedUrls.has(img.url)),
    [images, failedUrls]
  )

  const handleError = useCallback((url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url))
    setCurrent(0)
  }, [])

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? validImages.length - 1 : c - 1)), [validImages.length])
  const next = useCallback(() => setCurrent((c) => (c === validImages.length - 1 ? 0 : c + 1)), [validImages.length])

  if (validImages.length === 0) return null

  const currentImg = validImages[current] ?? validImages[0]

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-black/20 ${className}`}>
      {/* Image with 16:9 aspect ratio */}
      <div className="aspect-video">
        <img
          src={currentImg.url}
          alt={currentImg.alt || `Screenshot ${current + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={() => handleError(currentImg.url)}
        />
      </div>

      {/* Controls (only if multiple images) */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Próxima"
          >
            <ChevronRight size={18} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-primary' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Imagem ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 font-body text-xs text-white">
            {current + 1} / {validImages.length}
          </span>
        </>
      )}
    </div>
  )
})

ImageCarouselSimple.displayName = 'ImageCarouselSimple'
