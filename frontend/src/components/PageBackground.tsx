import { memo } from 'react'

export const PageBackground = memo(() => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {/* Top gradient glow */}
    <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />

    {/* Side accents */}
    <div className="absolute -left-20 top-1/3 h-[400px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
    <div className="absolute -right-20 top-2/3 h-[350px] w-[250px] rounded-full bg-accent/5 blur-[100px]" />

    {/* Bottom gradient */}
    <div className="absolute -bottom-20 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

    {/* Subtle grid pattern */}
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
