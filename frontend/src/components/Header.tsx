import { MouseEvent, useState, useCallback, memo } from 'react'
import { scrollToSection } from '@/utils/scrollToSection'

const navItems = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Projetos', href: '#portfolio' },
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Contato', href: '#contato' },
]

export const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = useCallback(
    (hash: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      setMobileMenuOpen(false)
      scrollToSection(hash)
    },
    []
  )

  const handleMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const handleMenuClose = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-end">
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm font-semibold uppercase text-white/80">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="tracking-[0.25em] transition-colors hover:text-white"
                  onClick={handleNavClick(item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="text-3xl text-white lg:hidden"
          aria-label="Abrir menu"
          onClick={handleMenuToggle}
        >
          <i className="bx bx-menu" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            role="presentation"
            onClick={handleMenuClose}
          />
          <div className="fixed right-0 top-0 flex h-full w-3/4 max-w-xs flex-col bg-primary px-8 py-10 shadow-xl">
            <button
              type="button"
              className="ml-auto text-3xl text-white"
              aria-label="Fechar menu"
              onClick={handleMenuClose}
            >
              <i className="bx bx-x" />
            </button>
            <ul className="mt-10 flex flex-col gap-4 text-lg font-semibold uppercase text-white">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block py-2 tracking-[0.2em] hover:text-accent-soft"
                    onClick={handleNavClick(item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  )
})

Header.displayName = 'Header'
