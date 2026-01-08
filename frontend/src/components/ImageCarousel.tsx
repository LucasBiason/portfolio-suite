import { memo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ImageCarouselProps = {
  images: string[]
  alt: string
}

export const ImageCarousel = memo(({ images, alt }: ImageCarouselProps) => {
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

  if (images.length === 1) {
    return (
      <div className="mb-4 rounded-lg overflow-hidden">
        <img src={images[0]} alt={alt} className="w-full h-48 object-cover" />
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg overflow-hidden relative group">
      <div className="relative h-48 bg-[#0a0a0a]">
        <img
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1} de ${images.length}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-5 h-5" />
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

