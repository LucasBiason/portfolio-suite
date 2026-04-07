/**
 * @file AdminProfile.tsx
 * Admin page for editing the public portfolio profile, including bio, SEO metadata,
 * contact section copy, footer copy and avatar image upload.
 */

import { FC, FormEvent, useEffect, useState, useRef } from 'react'
import { User, CheckCircle, Upload, Camera, ImageIcon } from 'lucide-react'
import { fetchAdminProfile, updateProfile, uploadAsset } from '@/services/api'
import { getAssetUrl } from '@/utils/assetUrl'
import { PageHeader } from './components/PageHeader'
import { FormField } from './components/FormField'

/** Raw profile data shape returned by the admin profile API endpoint. */
type ProfileData = {
  name?: string
  title?: string
  subtitle?: string
  bio?: string
  highlights?: string[]
  avatarUrl?: string
  heroBackgroundUrl?: string
  seo?: { title?: string; description?: string }
  footer?: { title?: string; description?: string; tagline?: string }
}

/** Controlled form state for editing the portfolio profile. */
type ProfileForm = {
  displayName: string
  email: string
  title: string
  subtitle: string
  bio: string
  highlights: string
  avatarUrl: string
  heroBackgroundUrl: string
  seoTitle: string
  seoDescription: string
  contactTitle: string
  contactSubtitle: string
  contactDescription: string
  footerTitle: string
  footerDescription: string
  footerTagline: string
}

/** Returns a blank ProfileForm initialised with empty strings. */
const emptyForm = (): ProfileForm => ({
  displayName: '',
  email: '',
  title: '',
  subtitle: '',
  bio: '',
  highlights: '',
  avatarUrl: '',
  heroBackgroundUrl: '',
  seoTitle: '',
  seoDescription: '',
  contactTitle: '',
  contactSubtitle: '',
  contactDescription: '',
  footerTitle: '',
  footerDescription: '',
  footerTagline: '',
})

/**
 * Renders the admin profile editing page.
 * Loads the current profile data, provides form fields for all editable sections,
 * and handles avatar image upload and form submission.
 * Used at the /admin/profile route.
 */
export const AdminProfile: FC = () => {
  const [form, setForm] = useState<ProfileForm>(emptyForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const heroFileRef = useRef<HTMLInputElement>(null)
  const [uploadingHero, setUploadingHero] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const raw = await fetchAdminProfile()
        const data = raw as ProfileData & { email?: string; contact?: { title?: string; subtitle?: string; description?: string } }
        setForm({
          displayName: data.name ?? '',
          email: data.email ?? '',
          title: data.title ?? '',
          subtitle: data.subtitle ?? '',
          bio: data.bio ?? '',
          highlights: (data.highlights ?? []).join('\n'),
          avatarUrl: data.avatarUrl ?? '',
          heroBackgroundUrl: data.heroBackgroundUrl ?? '',
          seoTitle: data.seo?.title ?? '',
          seoDescription: data.seo?.description ?? '',
          contactTitle: data.contact?.title ?? '',
          contactSubtitle: data.contact?.subtitle ?? '',
          contactDescription: data.contact?.description ?? '',
          footerTitle: data.footer?.title ?? '',
          footerDescription: data.footer?.description ?? '',
          footerTagline: data.footer?.tagline ?? '',
        })
      } catch {
        setError('Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const set = (field: keyof ProfileForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadAsset(file)
      setForm((prev) => ({ ...prev, avatarUrl: result.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    try {
      const result = await uploadAsset(file, 'hero')
      setForm((prev) => ({ ...prev, heroBackgroundUrl: result.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem de fundo')
    } finally {
      setUploadingHero(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const payload = {
      displayName: form.displayName,
      email: form.email,
      title: form.title,
      subtitle: form.subtitle,
      bio: form.bio,
      highlights: form.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      avatarUrl: form.avatarUrl || undefined,
      heroBackgroundUrl: form.heroBackgroundUrl || undefined,
      seo: {
        title: form.seoTitle || undefined,
        description: form.seoDescription || undefined,
      },
      contactTitle: form.contactTitle || undefined,
      contactSubtitle: form.contactSubtitle || undefined,
      contactDescription: form.contactDescription || undefined,
      footer: {
        title: form.footerTitle || undefined,
        description: form.footerDescription || undefined,
        tagline: form.footerTagline || undefined,
      },
    }

    try {
      await updateProfile(payload)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Perfil"
        subtitle="Informações exibidas no portfólio"
        icon={<User size={18} />}
      />

      {loading ? (
        <div className="bg-surface border border-white/5 rounded-xl p-8 text-center text-grey-30 font-body text-sm">
          Carregando...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar + Main info */}
          <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-5">
            <h3 className="font-header text-sm font-semibold text-grey-40 uppercase tracking-wide">
              Informações Principais
            </h3>

            {/* Avatar upload */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-background border-2 border-white/10">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl.startsWith('http') ? form.avatarUrl : getAssetUrl(form.avatarUrl)}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User size={32} className="text-grey-10" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-body font-medium text-white">Foto do Perfil</p>
                <p className="text-xs font-body text-grey-20 mt-1">
                  Clique no ícone da câmera para enviar uma nova foto. Formatos: JPG, PNG, WebP.
                </p>
              </div>
            </div>

            {/* Hero background upload */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-40 rounded-lg overflow-hidden bg-background border-2 border-white/10">
                  {form.heroBackgroundUrl ? (
                    <img
                      src={form.heroBackgroundUrl.startsWith('http') ? form.heroBackgroundUrl : getAssetUrl(form.heroBackgroundUrl)}
                      alt="Hero Background"
                      className="h-full w-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-grey-10" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => heroFileRef.current?.click()}
                  disabled={uploadingHero}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {uploadingHero ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  ) : (
                    <Upload size={14} />
                  )}
                </button>
                <input
                  ref={heroFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadHero}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-body font-medium text-white">Fundo do Hero</p>
                <p className="text-xs font-body text-grey-20 mt-1">
                  Imagem de fundo da seção principal (marca d'água). Recomendado: paisagem escura, 1920x1080+.
                </p>
              </div>
            </div>

            {/* User data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Nome completo"
                value={form.displayName}
                onChange={(e) => set('displayName')(e.target.value)}
                placeholder="Seu nome completo"
                hint="Exibido no header e rodapé do portfólio"
              />
              <FormField
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => set('email')(e.target.value)}
                placeholder="seu@email.com"
                hint="E-mail de contato público"
              />
            </div>

            <FormField
              label="Título"
              value={form.title}
              onChange={(e) => set('title')(e.target.value)}
              placeholder="Ex: Desenvolvedor Full Stack"
            />
            <FormField
              label="Subtítulo"
              value={form.subtitle}
              onChange={(e) => set('subtitle')(e.target.value)}
              placeholder="Ex: Especialista em Python e React"
            />
            <FormField
              as="textarea"
              label="Bio"
              value={form.bio}
              onChange={(e) => set('bio')(e.target.value)}
              rows={5}
              placeholder="Descrição profissional..."
            />
            <FormField
              as="textarea"
              label="Destaques"
              value={form.highlights}
              onChange={(e) => set('highlights')(e.target.value)}
              rows={4}
              placeholder="Um destaque por linha"
              hint="Cada linha vira um item da lista de destaques"
            />
          </div>

          {/* SEO */}
          <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="font-header text-sm font-semibold text-grey-40 uppercase tracking-wide">
              SEO (Mecanismos de Busca)
            </h3>
            <FormField
              label="Título (meta)"
              value={form.seoTitle}
              onChange={(e) => set('seoTitle')(e.target.value)}
              placeholder="Título para SEO"
            />
            <FormField
              as="textarea"
              label="Descrição (meta)"
              value={form.seoDescription}
              onChange={(e) => set('seoDescription')(e.target.value)}
              rows={2}
              placeholder="Descrição para SEO (máx. 160 caracteres)"
            />
          </div>

          {/* Contact form texts */}
          <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="font-header text-sm font-semibold text-grey-40 uppercase tracking-wide">
              Formulário de Contato
            </h3>
            <FormField
              label="Título da seção"
              value={form.contactTitle}
              onChange={(e) => set('contactTitle')(e.target.value)}
              placeholder="Ex: Vamos conversar"
              hint="Título exibido acima do formulário de contato"
            />
            <FormField
              label="Subtítulo"
              value={form.contactSubtitle}
              onChange={(e) => set('contactSubtitle')(e.target.value)}
              placeholder="Ex: Precisa de ajuda com APIs?"
            />
            <FormField
              as="textarea"
              label="Descrição"
              value={form.contactDescription}
              onChange={(e) => set('contactDescription')(e.target.value)}
              rows={2}
              placeholder="Texto descritivo abaixo do subtítulo"
            />
          </div>

          {/* Footer */}
          <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="font-header text-sm font-semibold text-grey-40 uppercase tracking-wide">
              Rodapé
            </h3>
            <FormField
              label="Título do rodapé"
              value={form.footerTitle}
              onChange={(e) => set('footerTitle')(e.target.value)}
              placeholder="Ex: Lucas Biason"
            />
            <FormField
              as="textarea"
              label="Descrição do rodapé"
              value={form.footerDescription}
              onChange={(e) => set('footerDescription')(e.target.value)}
              rows={2}
              placeholder="Breve descrição no rodapé"
            />
            <FormField
              label="Tagline do rodapé"
              value={form.footerTagline}
              onChange={(e) => set('footerTagline')(e.target.value)}
              placeholder="Ex: Feito com dedicação"
            />
          </div>

          {error && (
            <div className="text-sm text-red bg-red/10 border border-red/20 rounded-lg px-4 py-3 font-body">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-green bg-green/10 border border-green/20 rounded-lg px-4 py-3 font-body">
              <CheckCircle size={16} />
              Perfil salvo com sucesso.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-body font-semibold bg-primary hover:bg-primary-dark disabled:opacity-50 text-white transition-colors shadow-lg shadow-primary/20"
            >
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
