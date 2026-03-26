import { FC, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogIn, AlertCircle, Eye, EyeOff, Shield, Mail, Lock,
  Code, Database, Layers, Cloud, Cpu, Monitor, Wrench,
  Globe, Terminal, GitBranch, Braces, Server, Workflow,
  Binary, Boxes, Container, FileCode, Gauge, Network,
  Settings, Sparkles, Zap,
} from 'lucide-react'
import { setAuthToken } from '@/services/api'

// Scattered background icons - irregular positions, varied sizes, system colors
const bgIcons = [
  // Top region
  { Icon: Code, x: 3, y: 2, size: 40, rotate: -15, color: '#0047AB', opacity: 0.18 },
  { Icon: Globe, x: 22, y: 1, size: 28, rotate: 25, color: '#88c0d0', opacity: 0.14 },
  { Icon: FileCode, x: 42, y: 5, size: 34, rotate: -8, color: '#a3be8c', opacity: 0.16 },
  { Icon: Container, x: 62, y: 2, size: 26, rotate: 18, color: '#b48ead', opacity: 0.13 },
  { Icon: Database, x: 82, y: 4, size: 38, rotate: -22, color: '#5e81ac', opacity: 0.17 },
  { Icon: Boxes, x: 95, y: 1, size: 30, rotate: 12, color: '#d08770', opacity: 0.12 },

  // Upper-mid region
  { Icon: Cloud, x: 2, y: 18, size: 44, rotate: 10, color: '#30A0FF', opacity: 0.15 },
  { Icon: Layers, x: 18, y: 15, size: 22, rotate: -30, color: '#ebcb8b', opacity: 0.2 },
  { Icon: Terminal, x: 75, y: 16, size: 36, rotate: 20, color: '#a3be8c', opacity: 0.16 },
  { Icon: Sparkles, x: 92, y: 18, size: 24, rotate: -5, color: '#0047AB', opacity: 0.18 },
  { Icon: Binary, x: 35, y: 20, size: 20, rotate: 35, color: '#bf616a', opacity: 0.14 },

  // Mid-left (avoid center where form is)
  { Icon: GitBranch, x: 1, y: 33, size: 32, rotate: -18, color: '#d08770', opacity: 0.17 },
  { Icon: Server, x: 8, y: 48, size: 28, rotate: 22, color: '#88c0d0', opacity: 0.15 },
  { Icon: Network, x: 3, y: 62, size: 36, rotate: -12, color: '#5e81ac', opacity: 0.16 },
  { Icon: Wrench, x: 12, y: 38, size: 20, rotate: 40, color: '#b48ead', opacity: 0.13 },
  { Icon: Gauge, x: 6, y: 55, size: 24, rotate: -28, color: '#ebcb8b', opacity: 0.19 },

  // Mid-right
  { Icon: Cpu, x: 88, y: 32, size: 42, rotate: 15, color: '#b48ead', opacity: 0.16 },
  { Icon: Monitor, x: 92, y: 48, size: 30, rotate: -20, color: '#81a1c1', opacity: 0.18 },
  { Icon: Zap, x: 85, y: 58, size: 26, rotate: 28, color: '#30A0FF', opacity: 0.2 },
  { Icon: Settings, x: 95, y: 42, size: 20, rotate: -35, color: '#a3be8c', opacity: 0.14 },
  { Icon: Workflow, x: 82, y: 65, size: 34, rotate: 8, color: '#0047AB', opacity: 0.15 },

  // Lower region
  { Icon: Braces, x: 2, y: 78, size: 38, rotate: 5, color: '#0047AB', opacity: 0.17 },
  { Icon: Code, x: 20, y: 82, size: 30, rotate: -25, color: '#30A0FF', opacity: 0.15 },
  { Icon: Cloud, x: 40, y: 85, size: 24, rotate: 32, color: '#81a1c1', opacity: 0.13 },
  { Icon: Database, x: 58, y: 88, size: 36, rotate: -10, color: '#a3be8c', opacity: 0.18 },
  { Icon: Terminal, x: 78, y: 80, size: 28, rotate: 18, color: '#d08770', opacity: 0.16 },
  { Icon: Sparkles, x: 92, y: 82, size: 22, rotate: -32, color: '#ebcb8b', opacity: 0.2 },

  // Bottom edge
  { Icon: FileCode, x: 8, y: 92, size: 26, rotate: 15, color: '#bf616a', opacity: 0.14 },
  { Icon: Layers, x: 30, y: 95, size: 32, rotate: -20, color: '#5e81ac', opacity: 0.16 },
  { Icon: Cpu, x: 52, y: 93, size: 20, rotate: 25, color: '#88c0d0', opacity: 0.18 },
  { Icon: GitBranch, x: 70, y: 92, size: 34, rotate: -8, color: '#b48ead', opacity: 0.15 },
  { Icon: Network, x: 90, y: 94, size: 28, rotate: 30, color: '#0047AB', opacity: 0.13 },
  { Icon: Binary, x: 15, y: 72, size: 22, rotate: -15, color: '#30A0FF', opacity: 0.17 },
  { Icon: Boxes, x: 85, y: 75, size: 26, rotate: 22, color: '#ebcb8b', opacity: 0.14 },
  { Icon: Server, x: 48, y: 78, size: 18, rotate: -38, color: '#d08770', opacity: 0.16 },
  { Icon: Gauge, x: 65, y: 75, size: 30, rotate: 12, color: '#a3be8c', opacity: 0.19 },
  { Icon: Container, x: 25, y: 60, size: 22, rotate: -22, color: '#81a1c1', opacity: 0.13 },
  { Icon: Zap, x: 72, y: 55, size: 20, rotate: 35, color: '#bf616a', opacity: 0.17 },
  { Icon: Monitor, x: 18, y: 50, size: 18, rotate: -10, color: '#0047AB', opacity: 0.15 },
  { Icon: Wrench, x: 80, y: 22, size: 22, rotate: 28, color: '#ebcb8b', opacity: 0.16 },
  { Icon: Globe, x: 55, y: 12, size: 20, rotate: -18, color: '#bf616a', opacity: 0.14 },
] as const

const getApiBase = (): string => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }
  return window.location.origin
}

export const AdminLogin: FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Credenciais invalidas')
      }

      const data = await response.json()
      const token = data.token || data.accessToken
      if (!token) throw new Error('Token nao recebido')

      setAuthToken(token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
        {/* Scattered icons */}
        {bgIcons.map((item, i) => (
          <item.Icon
            key={i}
            size={item.size}
            className="absolute"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `rotate(${item.rotate}deg)`,
              color: item.color,
              opacity: item.opacity,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg shadow-primary/20">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="font-header text-3xl font-bold text-white tracking-tight">
            Portfolio <span className="text-accent">Admin</span>
          </h1>
          <p className="text-grey-20 text-sm mt-2 font-body">
            Acesse o painel de gerenciamento
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-body font-medium text-grey-30 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-20" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-background/70 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white text-sm font-body placeholder-grey-10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:bg-background outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-body font-medium text-grey-30 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-20" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-background/70 border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-white text-sm font-body placeholder-grey-10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:bg-background outline-none transition-all"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey-20 hover:text-grey-30 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 text-sm font-body bg-red/10 border border-red/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="shrink-0 text-red mt-0.5" />
                <span className="text-red/90">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-semibold text-sm rounded-xl px-4 py-3.5 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-grey-10 text-xs font-body mt-6">
          Portfolio Suite &middot; Painel Administrativo
        </p>
      </div>
    </div>
  )
}
