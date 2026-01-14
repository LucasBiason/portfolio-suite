import { memo, useState } from 'react'
import { normalizeImageUrls } from '@/utils/assetUrl'

type ImageCarouselProps = {
  images: string | string[]
  alt: string
  onImageClick?: (imageUrl: string) => void
}

export const ImageCarousel = memo(({ images, alt, onImageClick }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Normaliza URLs de imagens
  const normalizedImages = normalizeImageUrls(images)

  if (!normalizedImages || normalizedImages.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageClick = (imageUrl: string) => {
    if (onImageClick) {
      onImageClick(imageUrl)
    }
  }

  const hasClickHandler = !!onImageClick

  if (normalizedImages.length === 1) {
    return (
      <div 
        className={`mb-4 rounded-lg overflow-hidden ${hasClickHandler ? 'cursor-pointer' : ''}`} 
        onClick={hasClickHandler ? () => handleImageClick(normalizedImages[0]) : undefined}
      >
        <img 
          src={normalizedImages[0]} 
          alt={alt} 
          className={`w-full h-48 object-cover transition-opacity ${hasClickHandler ? 'hover:opacity-90' : ''}`} 
        />
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg overflow-hidden relative group">
      <div className="relative h-48 bg-[#0a0a0a]">
        <img
          src={normalizedImages[currentIndex]}
          alt={`${alt} - ${currentIndex + 1} de ${normalizedImages.length}`}
          className={`w-full h-full object-cover transition-opacity ${hasClickHandler ? 'cursor-pointer hover:opacity-90' : ''}`}
          onClick={hasClickHandler ? () => handleImageClick(normalizedImages[currentIndex]) : undefined}
        />
      
        {/* Navigation buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Imagem anterior"
        >
          <i className="bx bx-chevron-left text-xl" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Próxima imagem"
        >
          <i className="bx bx-chevron-right text-xl" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {normalizedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[#2658BD] w-6'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

ImageCarousel.displayName = 'ImageCarousel'
