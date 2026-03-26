import { FC, useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Briefcase,
  Layers,
  Wrench,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Settings,
  Tag,
  GraduationCap,
  Globe,
} from 'lucide-react'
import { clearAuthToken } from '@/services/api'
import { Logo } from '@/components/Logo'

type NavItem = {
  label: string
  path: string
  icon: FC<{ size?: number }>
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Perfil', path: '/admin/profile', icon: User },
  { label: 'Formação', path: '/admin/education', icon: GraduationCap },
  { label: 'Projetos', path: '/admin/projects', icon: FolderKanban },
  { label: 'Histórico', path: '/admin/career', icon: Briefcase },
  { label: 'Stacks', path: '/admin/stacks', icon: Layers },
  { label: 'Categorias', path: '/admin/categories', icon: Tag },
  { label: 'Domínios', path: '/admin/domains', icon: Globe },
  { label: 'Serviços', path: '/admin/services', icon: Wrench },
  { label: 'Contatos', path: '/admin/contacts', icon: MessageSquare },
  { label: 'Configurações', path: '/admin/settings', icon: Settings },
]

export const AdminLayout: FC = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    clearAuthToken()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors',
      isActive
        ? 'bg-primary text-white'
        : 'text-grey-30 hover:bg-white/5 hover:text-white',
    ].join(' ')

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Branding */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <div>
            <h1 className="font-header text-base font-bold text-white tracking-wide">Portfolio Suite</h1>
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-grey-20">Painel de Administração</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-body font-medium text-grey-20 hover:bg-white/5 hover:text-accent transition-colors"
        >
          <ExternalLink size={14} />
          Ver Portfólio
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-body font-medium text-grey-30 hover:bg-white/5 hover:text-red transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-surface border-r border-white/5 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-60 bg-surface border-r border-white/5 flex flex-col transition-transform duration-200 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Mobile top bar (only visible on small screens) */}
        <div className="lg:hidden sticky top-0 z-20 h-14 bg-surface/90 backdrop-blur-sm border-b border-white/5 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-grey-30 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Logo size={24} />
          <span className="font-header text-sm font-bold text-white">Portfolio Suite</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
