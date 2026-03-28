/**
 * @file PageBackground.tsx
 * Fixed decorative background layer with blurred radial gradients and a subtle
 * dot-grid pattern. Renders behind all page content (z-0, pointer-events-none).
 * Used on all inner public pages (Stacks, Career, Projects).
 */

import { memo } from 'react'

/**
 * Renders the decorative full-screen background layer.
 * Used on StacksPage, CareerPage and ProjectsPage.
 */
export const PageBackground = memo(() => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {/* Top radial glow */}
    <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />

    {/* Left and right side accent glows */}
    <div className="absolute -left-20 top-1/3 h-[400px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
    <div className="absolute -right-20 top-2/3 h-[350px] w-[250px] rounded-full bg-accent/5 blur-[100px]" />

    {/* Bottom radial gradient */}
    <div className="absolute -bottom-20 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

    {/* Subtle dot-grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.015]"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    />
  </div>
))

PageBackground.displayName = 'PageBackground'
