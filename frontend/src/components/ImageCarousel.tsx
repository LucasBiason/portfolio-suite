import { memo, useState } from 'react'

type ImageCarouselProps = {
  images: string[]
  alt: string
  onImageClick?: (imageUrl: string) => void
}

export const ImageCarousel = memo(({ images, alt, onImageClick }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
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

  if (images.length === 1) {
    return (
      <div 
        className={`mb-4 rounded-lg overflow-hidden ${hasClickHandler ? 'cursor-pointer' : ''}`} 
        onClick={hasClickHandler ? () => handleImageClick(images[0]) : undefined}
      >
        <img 
          src={images[0]} 
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
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1} de ${images.length}`}
          className={`w-full h-full object-cover transition-opacity ${hasClickHandler ? 'cursor-pointer hover:opacity-90' : ''}`}
          onClick={hasClickHandler ? () => handleImageClick(images[currentIndex]) : undefined}
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
          {images.map((_, index) => (
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
