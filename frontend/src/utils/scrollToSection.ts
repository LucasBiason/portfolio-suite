const HEADER_OFFSET = 80

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

    // Garante que nenhum título ou link fique com foco visível após o scroll
    if (document.body) {
      document.body.setAttribute('tabindex', '-1')
      document.body.focus()
      document.body.removeAttribute('tabindex')
    }
  })
}

