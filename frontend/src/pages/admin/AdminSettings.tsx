/**
 * @file AdminSettings.tsx
 * Admin page for managing global portfolio settings: colour theme, typography,
 * SMTP email configuration and public page copy (titles, subtitles, GitHub CTA).
 */

import { FC, useEffect, useState } from 'react'
import { Settings, Palette, Type, Save, RotateCcw, Mail, Send, FileText } from 'lucide-react'
import { fetchSettings, updateSettings, testEmail } from '@/services/api'
import { PageHeader } from './components/PageHeader'
import { FormField } from './components/FormField'

/** Controlled form state for all configurable global settings. */
type SettingsForm = {
  primaryColor: string
  primaryDarkColor: string
  accentColor: string
  accentSoftColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  headerFont: string
  bodyFont: string
  smtpHost: string
  smtpPort: string
  smtpSecure: boolean
  smtpUser: string
  smtpPass: string
  contactEmail: string
  projectsPageTitle: string
  projectsPageSubtitle: string
  projectsGithubUrl: string
  projectsGithubLabel: string
  projectsGithubHint: string
  careerPageTitle: string
  careerPageSubtitle: string
  stacksPageTitle: string
  stacksPageSubtitle: string
}

/** Default values applied when no settings have been saved to the API yet. */
const defaults: SettingsForm = {
  primaryColor: '#0047AB',
  primaryDarkColor: '#002D6B',
  accentColor: '#30A0FF',
  accentSoftColor: '#99C8FF',
  backgroundColor: '#121417',
  surfaceColor: '#1A1D22',
  textColor: '#ffffff',
  headerFont: 'Raleway',
  bodyFont: 'Open Sans',
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  contactEmail: '',
  projectsPageTitle: 'Projetos Pessoais & Formação',
  projectsPageSubtitle: '',
  projectsGithubUrl: '',
  projectsGithubLabel: 'Ver meu GitHub',
  projectsGithubHint: '',
  careerPageTitle: 'Histórico Profissional',
  careerPageSubtitle: '',
  stacksPageTitle: 'Stack & Ferramentas',
  stacksPageSubtitle: '',
}

const colorFields: { key: keyof SettingsForm; label: string; description: string }[] = [
  { key: 'primaryColor', label: 'Primary', description: 'Botões, CTAs, destaques principais' },
  { key: 'primaryDarkColor', label: 'Primary Dark', description: 'Hover de botões, gradientes' },
  { key: 'accentColor', label: 'Accent', description: 'Links, ícones, elementos interativos' },
  { key: 'accentSoftColor', label: 'Accent Soft', description: 'Tags, badges, texto secundário' },
  { key: 'backgroundColor', label: 'Background', description: 'Fundo principal das páginas' },
  { key: 'surfaceColor', label: 'Surface', description: 'Cards, sidebar, elementos elevados' },
  { key: 'textColor', label: 'Texto', description: 'Cor principal de texto' },
]

const fontOptions = [
  'Raleway', 'Open Sans', 'Inter', 'Poppins', 'Montserrat',
  'Roboto', 'Lato', 'Source Sans Pro', 'Nunito', 'Work Sans',
]

/**
 * Renders the admin settings page.
 * Loads current settings from the API, provides editors for theme colours, fonts,
 * SMTP configuration and public page copy, and handles form submission with live preview.
 * Used at the /admin/settings route.
 */
export const AdminSettings: FC = () => {
  const [form, setForm] = useState<SettingsForm>(defaults)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [testingEmail, setTestingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings() as Record<string, unknown>
        setForm({
          ...defaults,
          ...data,
          smtpPort: String(data.smtpPort ?? 587),
          smtpSecure: Boolean(data.smtpSecure),
        })
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      await updateSettings({
        ...form,
        smtpPort: parseInt(form.smtpPort, 10) || 587,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(defaults)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configurações"
        subtitle="Personalize as cores e fontes do portfólio"
        icon={<Settings size={18} />}
      />

      {/* Color Palette */}
      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-accent" />
            <h3 className="font-header text-lg font-semibold text-white">Paleta de Cores</h3>
          </div>
          <p className="mt-1 text-sm font-body text-grey-20">
            Defina as cores do portfólio público. As mudanças são aplicadas imediatamente após salvar.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {colorFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-body font-medium text-grey-30 mb-1.5">
                {field.label}
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={form[field.key] as string}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-12 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={form[field.key] as string}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono font-body focus:border-primary outline-none uppercase"
                  maxLength={7}
                  pattern="^#[0-9a-fA-F]{6}$"
                />
              </div>
              <p className="mt-1 text-xs font-body text-grey-10">{field.description}</p>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="px-6 pb-6">
          <p className="text-sm font-body font-medium text-grey-30 mb-3">Preview</p>
          <div
            className="rounded-xl p-6 border"
            style={{ backgroundColor: form.backgroundColor, borderColor: `${form.surfaceColor}50` }}
          >
            <div className="flex flex-wrap gap-3 items-center">
              <button
                className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: form.primaryColor }}
              >
                Botão Primary
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: form.primaryDarkColor }}
              >
                Botão Dark
              </button>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${form.accentColor}30`, color: form.accentColor }}
              >
                Tag Accent
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${form.accentSoftColor}30`, color: form.accentSoftColor }}
              >
                Tag Soft
              </span>
              <span className="text-sm" style={{ color: form.textColor }}>Texto principal</span>
            </div>
            <div
              className="mt-3 rounded-lg p-3"
              style={{ backgroundColor: form.surfaceColor }}
            >
              <p className="text-sm" style={{ color: form.textColor }}>
                Card em Surface com texto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Type size={18} className="text-accent" />
            <h3 className="font-header text-lg font-semibold text-white">Tipografia</h3>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-body font-medium text-grey-30 mb-1.5">
              Fonte de Títulos
            </label>
            <select
              value={form.headerFont}
              onChange={(e) => setForm((prev) => ({ ...prev, headerFont: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none"
            >
              {fontOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <p className="mt-2 text-lg" style={{ fontFamily: form.headerFont }}>
              Exemplo de título com {form.headerFont}
            </p>
          </div>
          <div>
            <label className="block text-sm font-body font-medium text-grey-30 mb-1.5">
              Fonte de Corpo
            </label>
            <select
              value={form.bodyFont}
              onChange={(e) => setForm((prev) => ({ ...prev, bodyFont: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:border-primary outline-none"
            >
              {fontOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <p className="mt-2 text-sm" style={{ fontFamily: form.bodyFont }}>
              Exemplo de texto com {form.bodyFont} para ver como fica em parágrafos.
            </p>
          </div>
        </div>
      </div>

      {/* Configuração das Páginas */}
      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-accent" />
            <h3 className="font-header text-lg font-semibold text-white">Textos das Páginas</h3>
          </div>
          <p className="mt-1 text-sm font-body text-grey-20">
            Títulos e subtítulos exibidos nas páginas públicas do portfólio.
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Projetos */}
          <div className="space-y-3">
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Página de Projetos</h4>
            <FormField label="Título" value={form.projectsPageTitle} onChange={(e) => setForm((prev) => ({ ...prev, projectsPageTitle: e.target.value }))} placeholder="Projetos Pessoais & Formação" />
            <FormField as="textarea" label="Subtítulo" value={form.projectsPageSubtitle} onChange={(e) => setForm((prev) => ({ ...prev, projectsPageSubtitle: e.target.value }))} rows={2} placeholder="Texto descritivo abaixo do título" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="URL do GitHub" value={form.projectsGithubUrl} onChange={(e) => setForm((prev) => ({ ...prev, projectsGithubUrl: e.target.value }))} placeholder="https://github.com/..." />
              <FormField label="Texto do botão GitHub" value={form.projectsGithubLabel} onChange={(e) => setForm((prev) => ({ ...prev, projectsGithubLabel: e.target.value }))} placeholder="Ver meu GitHub" />
            </div>
            <FormField label="Texto auxiliar do GitHub" value={form.projectsGithubHint} onChange={(e) => setForm((prev) => ({ ...prev, projectsGithubHint: e.target.value }))} placeholder="Todos os projetos com código-fonte aberto..." />
          </div>

          {/* Histórico */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Página de Histórico</h4>
            <FormField label="Título" value={form.careerPageTitle} onChange={(e) => setForm((prev) => ({ ...prev, careerPageTitle: e.target.value }))} placeholder="Histórico Profissional" />
            <FormField as="textarea" label="Subtítulo" value={form.careerPageSubtitle} onChange={(e) => setForm((prev) => ({ ...prev, careerPageSubtitle: e.target.value }))} rows={2} placeholder="Texto descritivo abaixo do título" />
          </div>

          {/* Stacks */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-grey-20">Página de Stacks</h4>
            <FormField label="Título" value={form.stacksPageTitle} onChange={(e) => setForm((prev) => ({ ...prev, stacksPageTitle: e.target.value }))} placeholder="Stack & Ferramentas" />
            <FormField as="textarea" label="Subtítulo" value={form.stacksPageSubtitle} onChange={(e) => setForm((prev) => ({ ...prev, stacksPageSubtitle: e.target.value }))} rows={2} placeholder="Texto descritivo abaixo do título" />
          </div>
        </div>
      </div>

      {/* SMTP / E-mail */}
      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-accent" />
            <h3 className="font-header text-lg font-semibold text-white">Configurações de E-mail (SMTP)</h3>
          </div>
          <p className="mt-1 text-sm font-body text-grey-20">
            Configure o servidor SMTP para envio de mensagens do formulário de contato do portfólio.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              label="Servidor SMTP"
              value={form.smtpHost}
              onChange={(e) => setForm((prev) => ({ ...prev, smtpHost: e.target.value }))}
              placeholder="smtp.gmail.com"
              hint="Host do servidor de e-mail"
            />
            <FormField
              label="Porta"
              type="number"
              value={form.smtpPort}
              onChange={(e) => setForm((prev) => ({ ...prev, smtpPort: e.target.value }))}
              placeholder="587"
              hint="587 (TLS) ou 465 (SSL)"
            />
            <div>
              <label className="block text-sm font-body font-medium text-grey-30 mb-1.5">
                Conexão segura (SSL)
              </label>
              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.smtpSecure}
                  onChange={(e) => setForm((prev) => ({ ...prev, smtpSecure: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/10 bg-background text-primary focus:ring-primary"
                />
                <span className="text-sm font-body text-grey-30">
                  {form.smtpSecure ? 'SSL ativado (porta 465)' : 'TLS/STARTTLS (porta 587)'}
                </span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Usuário SMTP"
              value={form.smtpUser}
              onChange={(e) => setForm((prev) => ({ ...prev, smtpUser: e.target.value }))}
              placeholder="seu-email@gmail.com"
              hint="E-mail usado para autenticação"
            />
            <FormField
              label="Senha / App Password"
              type="password"
              value={form.smtpPass}
              onChange={(e) => setForm((prev) => ({ ...prev, smtpPass: e.target.value }))}
              placeholder="••••••••"
              hint="Senha ou App Password do provedor"
            />
          </div>
          <FormField
            label="E-mail de destino"
            value={form.contactEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
            placeholder="contato@seudominio.com"
            hint="E-mail que recebe as mensagens do formulário de contato"
          />

          {/* Test button + result */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={async () => {
                setTestingEmail(true)
                setEmailResult(null)
                try {
                  const result = await testEmail()
                  setEmailResult({ ok: result.success, msg: result.message || result.error || '' })
                } catch (err) {
                  setEmailResult({ ok: false, msg: err instanceof Error ? err.message : 'Erro ao testar' })
                } finally {
                  setTestingEmail(false)
                }
              }}
              disabled={testingEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium text-white bg-accent/80 hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              {testingEmail ? 'Enviando...' : 'Enviar e-mail de teste'}
            </button>
            {emailResult && (
              <span className={`text-sm font-body ${emailResult.ok ? 'text-green' : 'text-red'}`}>
                {emailResult.msg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        {success && (
          <span className="text-sm font-body text-green">Configurações salvas com sucesso!</span>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body text-grey-30 border border-white/10 hover:text-white hover:bg-white/5 transition-colors"
        >
          <RotateCcw size={15} />
          Restaurar padrão
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-body font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  )
}
