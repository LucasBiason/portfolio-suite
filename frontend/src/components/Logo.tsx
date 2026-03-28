/**
 * @file Logo.tsx
 * Custom SVG logo for the Portfolio Suite.
 * Renders a stylised document/portfolio icon with a primary-colour background
 * and a blue accent dot. Used in both the public header and the admin sidebar.
 */

import { memo } from 'react'

/** Props for the Logo SVG component. */
type LogoProps = {
  size?: number
  className?: string
}

/**
 * Renders the Portfolio Suite SVG logo at the specified size.
 * Used in the public Header and the AdminLayout sidebar.
 */
export const Logo = memo(({ size = 32, className = '' }: LogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background rounded square */}
    <rect width="40" height="40" rx="10" fill="#0047AB" />

    {/* Document/portfolio shape */}
    <rect x="10" y="8" width="20" height="24" rx="3" fill="none" stroke="white" strokeWidth="2" />

    {/* Top fold */}
    <path d="M10 14 H30" stroke="white" strokeWidth="1.5" opacity="0.5" />

    {/* Lines representing content */}
    <rect x="14" y="18" width="12" height="1.5" rx="0.75" fill="white" opacity="0.7" />
    <rect x="14" y="22" width="9" height="1.5" rx="0.75" fill="white" opacity="0.5" />
    <rect x="14" y="26" width="10" height="1.5" rx="0.75" fill="white" opacity="0.3" />

    {/* Accent dot */}
    <circle cx="31" cy="9" r="4" fill="#30A0FF" />
  </svg>
))

Logo.displayName = 'Logo'
