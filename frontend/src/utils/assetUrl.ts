/**
 * Normaliza URLs de assets para usar o domínio correto em produção.
 * Em desenvolvimento, usa localhost:3001. Em produção, usa o domínio atual.
 */
export const getAssetUrl = (path: string): string => {
  if (typeof window === 'undefined') {
    return path
  }
  
  // Se o path já é uma URL completa, retorna como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Se o path começa com /, usa o domínio atual
  if (path.startsWith('/')) {
    return window.location.origin + path
  }
  
  // Development fallback
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:3001${path.startsWith('/') ? path : '/' + path}`
  }
  
  // Production: usa domínio atual
  return window.location.origin + (path.startsWith('/') ? path : '/' + path)
}

/**
 * Normaliza um array de URLs de imagens.
 */
export const normalizeImageUrls = (imageUrl: string | string[] | null | undefined): string[] => {
  if (!imageUrl) return []
  
  const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
  return images.map(img => getAssetUrl(img))
}

