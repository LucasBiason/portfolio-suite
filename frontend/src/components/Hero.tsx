/**
 * @file Hero.tsx
 * Full-viewport hero section of the landing page.
 * Displays the portfolio owner's avatar, name, subtitle and primary CTA links.
 * Also updates the document title and meta description dynamically from SEO settings.
 */

import { useEffect, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { scrollToSection } from "@/utils/scrollToSection";
import { getAssetUrl } from "@/utils/assetUrl";

const DEFAULT_SEO_TITLE = "Portfolio API";
const DEFAULT_SEO_DESCRIPTION =
  "Portfólio dinâmico abastecido por um backend que controla todo o conteúdo.";

/**
 * Updates the <meta name="description"> tag content.
 *
 * @param description - The new meta description text.
 */
const updateMetaDescription = (description: string) => {
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute("content", description);
  }
};

/**
 * Renders the hero section with the owner's avatar, social links and CTA buttons.
 * Used on the landing page (App.tsx).
 */
export const Hero = memo(() => {
  const { user, loading } = useUser();

  const seoData = useMemo(
    () => ({
      title: user?.seo?.title ?? DEFAULT_SEO_TITLE,
      description: user?.seo?.description ?? DEFAULT_SEO_DESCRIPTION,
    }),
    [user?.seo?.title, user?.seo?.description],
  );

  useEffect(() => {
    document.title = seoData.title;
    updateMetaDescription(seoData.description);
  }, [seoData.title, seoData.description]);

  if (loading || !user) {
    return (
      <section
        id="inicio"
        className="relative min-h-[calc(100vh-4rem)] bg-secondary"
      >
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="font-body text-grey-20">
            Carregando dados do portfólio...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-hero-gradient-from to-hero-gradient-to" />
      {user.heroBackgroundUrl && (
        <div
          className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-lighten"
          style={{
            backgroundImage: `url('${getAssetUrl(user.heroBackgroundUrl)}')`,
          }}
        />
      )}
      <div className="container relative z-20 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 py-16 sm:flex-row sm:py-20">
        <div className="flex w-full shrink-0 flex-col items-center gap-4 sm:w-auto">
          {/*
            Wrapper com tamanho fixo: em mobile (flex-col + preflight em img) o círculo
            podia colapsar e a foto parecia um ponto.
          */}
          <div className="flex h-52 w-52 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-accent-soft bg-background/20 shadow-2xl xs:h-56 xs:w-56 sm:h-64 sm:w-64">
            <img
              src={getAssetUrl(user.avatarUrl || "/assets/img/avatar.jpg")}
              alt={user.name}
              width={256}
              height={256}
              className="h-full w-full max-w-none object-cover"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.fallbackSet) {
                  target.dataset.fallbackSet = "true";
                  target.src = getAssetUrl("/assets/img/avatar.jpg");
                } else {
                  target.style.display = "none";
                }
              }}
            />
          </div>
          {/* Social links displayed below the avatar */}
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
          <h1 className="mt-5 font-header text-4xl text-white sm:text-5xl md:text-6xl">
            {user.title}
          </h1>
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
  );
});

Hero.displayName = "Hero";
