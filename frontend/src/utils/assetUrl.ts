/**
 * @file assetUrl.ts
 * Utilities for resolving asset URLs across development and production.
 * In development, falls back to localhost:3001. In production, uses the current origin.
 */

/**
 * Normalises an asset path to an absolute URL using the correct domain.
 *
 * @param path - A relative path (e.g. "/assets/img/avatar.jpg") or absolute URL.
 * @returns The fully-qualified URL string.
 */
export const getAssetUrl = (path: string): string => {
  if (typeof window === "undefined") {
    return path;
  }

  // Absolute URL: em páginas HTTPS, evitar conteúdo misto (Safari iOS bloqueia http://)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (path.startsWith("http://") && window.location.protocol === "https:") {
      try {
        const u = new URL(path);
        u.protocol = "https:";
        return u.toString();
      } catch {
        return path.replace(/^http:\/\//i, "https://");
      }
    }
    return path;
  }

  // Protocol-relative (//cdn.example/...) — fixa o protocolo atual (evita falhas em alguns mobile)
  if (path.startsWith("//")) {
    return `${window.location.protocol}${path}`;
  }

  // Relative path starting with "/" — prepend current origin
  if (path.startsWith("/")) {
    return window.location.origin + path;
  }

  // Development fallback
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return `http://localhost:3001${path.startsWith("/") ? path : "/" + path}`;
  }

  // Production: use current origin
  return window.location.origin + (path.startsWith("/") ? path : "/" + path);
};

/**
 * Normalises a single URL or array of image URLs to absolute URL strings.
 *
 * @param imageUrl - A single URL string, array of URL strings, null or undefined.
 * @returns An array of normalised absolute URL strings.
 */
export const normalizeImageUrls = (
  imageUrl: string | string[] | null | undefined,
): string[] => {
  if (!imageUrl) return [];

  const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
  return images.map((img) => getAssetUrl(img));
};
