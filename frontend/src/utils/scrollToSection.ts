/**
 * @file scrollToSection.ts
 * Utility for smooth-scrolling to named anchor sections, accounting for
 * the fixed header height, and cleaning up the URL hash afterward.
 */

/** Pixel offset applied to scroll position to account for the fixed header. */
const HEADER_OFFSET = 80

/**
 * Smoothly scrolls the page to the element matching the given hash,
 * offset by the header height. Removes the hash from the URL after scrolling
 * and prevents visible focus rings triggered by programmatic focus.
 *
 * @param hash - The anchor hash string (e.g. "#sobre" or "#inicio").
 */
export const scrollToSection = (hash: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  const targetId = hash.replace('#', '')
  const targetElement =
    targetId === 'inicio'
      ? document.body
      : (document.querySelector(`#${targetId}`) as HTMLElement | null)

  if (!targetElement) {
    return
  }

  const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY
  const offsetPosition = Math.max(elementPosition - HEADER_OFFSET, 0)

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  })

  window.requestAnimationFrame(() => {
    const { pathname, search } = window.location
    window.history.replaceState(null, '', `${pathname}${search}`)

    // Ensure no heading or link retains a visible focus ring after scrolling
    if (document.body) {
      document.body.setAttribute('tabindex', '-1')
      document.body.focus()
      document.body.removeAttribute('tabindex')
    }
  })
}

