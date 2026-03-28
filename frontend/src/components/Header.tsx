/**
 * @file Header.tsx
 * Fixed top navigation bar for both the landing page and inner pages.
 * Shows section-anchor links on the landing page and route links on other pages.
 * Includes a responsive mobile slide-in menu.
 */

import { MouseEvent, useState, useCallback, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { scrollToSection } from '@/utils/scrollToSection'
import { Logo } from '@/components/Logo'
import { useUser } from '@/hooks/useUser'

const landingNavItems = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Contato', href: '#contato' },
]

const pageNavItems = [
  { label: 'Projetos & Formação', to: '/projetos' },
  { label: 'Histórico', to: '/historico' },
  { label: 'Stacks', to: '/stacks' },
]

/**
 * Renders the fixed top header with navigation links and a mobile menu.
 * Used at the top of every public page.
 */
export const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const { user } = useUser()

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
      <div className="container flex h-16 items-center gap-8">
        {/* Logo — always visible */}
        <Link
          to="/"
          className="flex items-center gap-2.5 flex-shrink-0"
        >
          <Logo size={32} />
          <span className="hidden sm:block font-header text-sm font-semibold tracking-[0.15em] text-white/90 uppercase">
            {user?.name ?? 'Portfolio'}
          </span>
        </Link>

        {/* Desktop nav — pushed to the right */}
        <nav className="hidden lg:flex flex-1 justify-end">
          <ul className="flex items-center gap-8 text-sm font-semibold uppercase text-white/80">
            {isLanding &&
              landingNavItems.map((item) => (
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
            {pageNavItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`tracking-[0.25em] transition-colors hover:text-white ${
                    location.pathname === item.to ? 'text-white' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="ml-auto text-3xl text-white lg:hidden"
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
              {!isLanding && (
                <li>
                  <Link
                    to="/"
                    className="block py-2 tracking-[0.2em] hover:text-accent-soft"
                    onClick={handleMenuClose}
                  >
                    Portfolio
                  </Link>
                </li>
              )}
              {isLanding &&
                landingNavItems.map((item) => (
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
              {pageNavItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="block py-2 tracking-[0.2em] hover:text-accent-soft"
                    onClick={handleMenuClose}
                  >
                    {item.label}
                  </Link>
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
