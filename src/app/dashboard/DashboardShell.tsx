'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Productos', icon: ShoppingCart, href: '/dashboard', disabled: true },
  { label: 'Pedidos', icon: Store, href: '/dashboard', disabled: true },
  { label: 'Clientes', icon: Users, href: '/dashboard', disabled: true },
  { label: 'Estadísticas', icon: BarChart3, href: '/dashboard', disabled: true },
  { label: 'Configuración', icon: Settings, href: '/dashboard/settings' },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 border-r border-gray-800">
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              JO<span className="text-blue-400">-Shop</span>
            </h1>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.disabled ? '#' : item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : item.disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {item.disabled && (
                  <span className="ml-auto text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                    Pronto
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-blue-500/20">
              <AvatarFallback className="text-blue-400 text-sm font-semibold">
                {getInitials(user?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 h-16 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-400 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-gray-900 border-gray-800 p-0">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <div className="flex items-center h-16 px-6 border-b border-gray-800">
                  <Link href="/" className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">
                      JO<span className="text-blue-400">-Shop</span>
                    </h1>
                  </Link>
                </div>
                <nav className="px-3 py-4 space-y-1">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.label}
                        href={item.disabled ? '#' : item.href}
                        onClick={() => !item.disabled && setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-blue-500/10 text-blue-400'
                            : item.disabled
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-200 transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-200">
                {pathname === '/dashboard' ? 'Dashboard' : pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                  <Avatar className="h-7 w-7 bg-blue-500/20">
                    <AvatarFallback className="text-blue-400 text-xs font-semibold">
                      {getInitials(user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-gray-300">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 w-56">
                <DropdownMenuLabel className="text-gray-300">
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-gray-500 font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem asChild className="text-gray-400 focus:text-white focus:bg-gray-800 cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
