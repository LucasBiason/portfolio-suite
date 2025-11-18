import { memo } from 'react'
import { useUser } from '@/hooks/useUser'

export const Footer = memo(() => {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
  <footer className="relative bg-gradient-to-r from-secondary via-black to-secondary py-10">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-primary blur-3xl" />
      <div className="absolute right-10 bottom-6 h-28 w-28 rounded-full bg-yellow/60 blur-3xl" />
    </div>
    <div className="container relative flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
      <div>
        <p className="font-header text-sm uppercase tracking-[0.3em] text-grey-20">
          {user.footer?.title ?? user.name}
        </p>
        <p className="mt-2 max-w-lg font-body text-sm text-white/80">
          {user.footer?.description ?? user.bio}
        </p>
      </div>
      <div className="flex items-center gap-4 text-white">
        {user.socialLinks.map((item) => (
          <a
            key={item.icon}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl transition transform hover:-translate-y-1 hover:border-yellow hover:text-yellow"
          >
            <i className={`bx ${item.icon}`} />
          </a>
        ))}
      </div>
    </div>
    <div className="mt-6 text-center font-body text-xs uppercase tracking-[0.4em] text-grey-30">
      © {new Date().getFullYear()} • {user.footer?.tagline ?? 'Portfólio dinâmico via API'}
    </div>
  </footer>
  )
})

Footer.displayName = 'Footer'
