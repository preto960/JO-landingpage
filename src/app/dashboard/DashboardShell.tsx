'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
  Home,
  ChevronRight,
  Store,
  Shield,
} from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS, Role, hasMinRole } from '@/lib/rbac'

type SidebarItem = {
  label: string
  icon: any
  href: string
  disabled?: boolean
  minRole?: Role
}

const allSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Productos', icon: ShoppingCart, href: '/dashboard', disabled: true },
  { label: 'Pedidos', icon: Store, href: '/dashboard', disabled: true },
  { label: 'Usuarios', icon: Shield, href: '/dashboard/users', minRole: 'super_admin' },
  { label: 'Configuración', icon: Settings, href: '/dashboard/settings', minRole: 'admin' },
]

function getVisibleItems(userRole: string): SidebarItem[] {
  return allSidebarItems.filter((item) => {
    if (item.minRole) return hasMinRole(userRole as Role, item.minRole)
    return true
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function NavItem({
  item,
  isActive,
  pathname,
  onNavigate,
}: {
  item: typeof sidebarItems[number]
  isActive: boolean
  pathname: string
  onNavigate?: () => void
}) {
  const Icon = item.icon

  const baseStyle: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontSize: '.78rem',
    fontWeight: 400,
    letterSpacing: '.1em',
    textTransform: 'uppercase' as const,
    transition: 'all .2s ease',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.75rem',
    width: '100%',
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
    color: isActive ? '#C9A84C' : item.disabled ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.45)',
    background: isActive ? 'rgba(201,168,76,.06)' : 'transparent',
  }

  return (
    <Link
      href={item.disabled ? '#' : item.href}
      style={baseStyle}
      onClick={(e) => {
        if (item.disabled) {
          e.preventDefault()
          return
        }
        onNavigate?.()
      }}
      onMouseEnter={(e) => {
        if (!isActive && !item.disabled) {
          e.currentTarget.style.color = 'rgba(245,240,232,.7)'
          e.currentTarget.style.background = 'rgba(245,240,232,.03)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = item.disabled ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.45)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.5 }} />
      <span>{item.label}</span>
      {item.disabled && (
        <span
          className="ml-auto text-[9px] px-1.5 py-0.5"
          style={{
            fontFamily: "'Jost', sans-serif",
            letterSpacing: '.08em',
            textTransform: 'uppercase' as const,
            color: 'rgba(245,240,232,.2)',
            background: 'rgba(245,240,232,.03)',
          }}
        >
          Pronto
        </span>
      )}
    </Link>
  )
}

export default function DashboardShell({
  user,
  children,
}: {
  user: { name: string; email: string; role?: string; image?: string; id?: string }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0"
        style={{
          background: '#111111',
          borderRight: '1px solid rgba(245,240,232,.06)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-16 px-6"
          style={{ borderBottom: '1px solid rgba(201,168,76,.1)' }}
        >
          <Link href="/" className="flex items-center gap-2">
            <h1
              className="text-xl font-light tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
            >
              <span style={{ color: '#C9A84C' }}>JO</span>
            </h1>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
          {getVisibleItems(user?.role || 'viewer').map((item) => (
            <NavItem
              key={item.label}
              item={item}
              isActive={pathname === item.href}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* User section at bottom */}
        <div style={{ borderTop: '1px solid rgba(245,240,232,.06)' }} className="p-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-8 w-8"
              style={{ background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.15)' }}
            >
              <AvatarFallback
                className="text-xs font-medium"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  color: '#C9A84C',
                  background: 'transparent',
                }}
              >
                {getInitials(user?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs truncate"
                style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.6)' }}
              >
                {user?.name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}
              >
                {user?.email}
              </p>
              <span
                className="inline-block mt-1 px-1.5 py-0.5"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: '.5rem', textTransform: 'uppercase', letterSpacing: '.08em', color: ROLE_COLORS[(user?.role as Role) || 'viewer'], background: 'rgba(201,168,76,.05)' }}
              >
                {ROLE_LABELS[(user?.role as Role) || 'viewer']}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top header */}
        <header
          className="sticky top-0 z-40 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-8"
          style={{
            background: 'rgba(10,10,10,.95)',
            borderBottom: '1px solid rgba(245,240,232,.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile hamburger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-1.5 sm:p-2 transition-colors duration-200"
                  style={{ color: 'rgba(245,240,232,.45)' }}
                >
                  <Menu className="w-5 h-5" style={{ strokeWidth: 1.5 }} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 p-0"
                style={{ background: '#111111', borderRight: '1px solid rgba(245,240,232,.06)' }}
              >
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                {/* Mobile sidebar header */}
                <div
                  className="flex items-center h-16 px-6"
                  style={{ borderBottom: '1px solid rgba(201,168,76,.1)' }}
                >
                  <Link href="/" className="flex items-center gap-2">
                    <h1
                      className="text-xl font-light tracking-wide"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
                    >
                      <span style={{ color: '#C9A84C' }}>JO</span>
                    </h1>
                  </Link>
                </div>
                {/* Mobile nav items */}
                <nav className="px-2 py-6 space-y-1">
                  {getVisibleItems(user?.role || 'viewer').map((item) => (
                    <NavItem
                      key={item.label}
                      item={item}
                      isActive={pathname === item.href}
                      pathname={pathname}
                      onNavigate={() => setSidebarOpen(false)}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Link
                href="/dashboard"
                className="transition-colors duration-200"
                style={{ color: 'rgba(245,240,232,.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}
              >
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-3 h-3" style={{ color: 'rgba(245,240,232,.15)' }} />
              <span style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.6)', fontSize: '.85rem' }}>
                {pathname === '/dashboard'
                  ? 'Dashboard'
                  : pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              className="relative p-2 transition-colors duration-200"
              style={{ color: 'rgba(245,240,232,.35)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.35)')}
            >
              <Bell className="w-5 h-5" style={{ strokeWidth: 1.5 }} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2"
                style={{ background: '#C9A84C', borderRadius: '50%' }}
              />
            </button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 h-9 px-2"
                  style={{ color: 'rgba(245,240,232,.6)' }}
                >
                  <Avatar
                    className="h-7 w-7"
                    style={{ background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.15)' }}
                  >
                    <AvatarFallback
                      className="text-[10px] font-medium"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: '#C9A84C',
                        background: 'transparent',
                      }}
                    >
                      {getInitials(user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="hidden sm:inline text-sm"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    {user?.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-1"
                style={{
                  background: '#1C1C1C',
                  border: '1px solid rgba(245,240,232,.07)',
                }}
              >
                <DropdownMenuLabel
                  className="p-3"
                  style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.6)' }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm" style={{ color: '#F5F0E8' }}>{user?.name}</span>
                    <span className="text-[10px] mt-0.5" style={{ color: 'rgba(245,240,232,.3)' }}>
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <div
                  className="my-1"
                  style={{ height: '1px', background: 'rgba(245,240,232,.06)' }}
                />
                {['admin', 'super_admin'].includes(user?.role || '') && (
                <DropdownMenuItem asChild className="cursor-pointer p-2.5">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 text-xs"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: 'rgba(245,240,232,.5)',
                      letterSpacing: '.05em',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F0E8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.5)')}
                  >
                    <Settings className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="cursor-pointer p-2.5"
                >
                  <span
                    className="flex items-center gap-2 text-xs"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: '#f87171',
                      letterSpacing: '.05em',
                    }}
                  >
                    <LogOut className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                    Cerrar sesión
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
