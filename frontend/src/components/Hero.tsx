import { useEffect, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@/hooks/useUser'
import { scrollToSection } from '@/utils/scrollToSection'
import { getAssetUrl } from '@/utils/assetUrl'

const DEFAULT_SEO_TITLE = 'Portfolio API'
const DEFAULT_SEO_DESCRIPTION = 'Portfólio dinâmico abastecido por um backend que controla todo o conteúdo.'

const updateMetaDescription = (description: string) => {
  const meta = document.querySelector('meta[name="description"]')
  if (meta) {
    meta.setAttribute('content', description)
  }
}

export const Hero = memo(() => {
  const { user, loading } = useUser()

  const seoData = useMemo(
    () => ({
      title: user?.seo?.title ?? DEFAULT_SEO_TITLE,
      description: user?.seo?.description ?? DEFAULT_SEO_DESCRIPTION,
    }),
    [user?.seo?.title, user?.seo?.description]
  )

  useEffect(() => {
    document.title = seoData.title
    updateMetaDescription(seoData.description)
  }, [seoData.title, seoData.description])

  if (loading || !user) {
    return (
      <section id="inicio" className="relative min-h-[calc(100vh-4rem)] bg-secondary">
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="font-body text-grey-20">Carregando dados do portfólio...</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="inicio"
      className="relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${user.heroBackgroundUrl}')` }}
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-hero-gradient-from to-hero-gradient-to" />
      <div className="container relative z-20 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 py-16 sm:flex-row sm:py-20">
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <div className="rounded-full border-4 border-accent-soft shadow-2xl bg-background/20 overflow-hidden">
            <img
              src={getAssetUrl(user.avatarUrl || '/assets/img/avatar.jpg')}
              alt={user.name}
              className="h-56 w-56 rounded-full object-cover sm:h-64 sm:w-64"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.fallbackSet) {
                  target.dataset.fallbackSet = 'true';
                  target.src = getAssetUrl('/assets/img/avatar.jpg');
                } else {
                  target.style.display = 'none';
                }
              }}
            />
          </div>
          {/* Social links below avatar */}
          <div className="flex items-center gap-4 text-white">
            {user.socialLinks.map((item) => (
              <a
                key={item.icon}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xl transition hover:-translate-y-1 hover:border-accent hover:text-accent"
              >
                <i className={`bx ${item.icon}`} />
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-2xl text-center sm:text-left">
          <span className="font-body text-xs uppercase tracking-[0.35em] text-accent-soft">
            {user.subtitle}
          </span>
          <h1 className="mt-5 font-header text-4xl text-white sm:text-5xl md:text-6xl">{user.title}</h1>
          <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:justify-center">
            <Link
              to="/projetos"
              className="inline-flex items-center justify-center rounded-full bg-primary min-w-[220px] px-6 py-3 font-header text-sm font-bold uppercase tracking-[0.2em] text-white text-center transition-colors hover:bg-primary-dark"
            >
              Projetos & Formação
            </Link>
            <Link
              to="/historico"
              className="inline-flex items-center justify-center rounded-full bg-primary min-w-[220px] px-6 py-3 font-header text-sm font-bold uppercase tracking-[0.2em] text-white text-center transition-colors hover:bg-primary-dark"
            >
              Histórico Profissional
            </Link>
            <Link
              to="/stacks"
              className="inline-flex items-center justify-center rounded-full bg-primary min-w-[220px] px-6 py-3 font-header text-sm font-bold uppercase tracking-[0.2em] text-white text-center transition-colors hover:bg-primary-dark"
            >
              Stacks & Ferramentas
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
})

Hero.displayName = 'Hero'
