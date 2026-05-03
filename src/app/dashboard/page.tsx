import { auth } from '@/lib/auth'
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Package,
  Star,
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    title: 'Ventas Totales',
    value: '$0',
    change: '0%',
    trend: 'up' as const,
    icon: DollarSign,
    accent: '#22c55e',
  },
  {
    title: 'Pedidos',
    value: '0',
    change: '0%',
    trend: 'neutral' as const,
    icon: ShoppingCart,
    accent: '#C9A84C',
  },
  {
    title: 'Clientes',
    value: '0',
    change: '0%',
    trend: 'up' as const,
    icon: Users,
    accent: '#a78bfa',
  },
  {
    title: 'Visitas',
    value: '0',
    change: '0%',
    trend: 'neutral' as const,
    icon: Eye,
    accent: '#fb923c',
  },
]

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1
          className="text-3xl lg:text-4xl font-light"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
        >
          Bienvenido, <span style={{ color: '#C9A84C' }}>{user?.name?.split(' ')[0] || 'Admin'}</span>
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)' }}
        >
          Aquí tienes un resumen general de tu panel de administración.
        </p>
      </div>

      {/* Gold divider */}
      <div
        className="w-full h-px"
        style={{ background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)' }}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="p-5 transition-all duration-300"
              style={{
                background: 'rgba(28,28,28,.3)',
                border: '1px solid rgba(245,240,232,.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,.15)'
                e.currentTarget.style.background = 'rgba(28,28,28,.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,240,232,.06)'
                e.currentTarget.style.background = 'rgba(28,28,28,.3)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    border: '1px solid rgba(245,240,232,.06)',
                    background: 'rgba(245,240,232,.03)',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.accent, strokeWidth: 1.5 }} />
                </div>
                <div
                  className="flex items-center text-xs font-medium"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    color: stat.trend === 'up' ? 'rgba(34,197,94,.7)' : 'rgba(245,240,232,.2)',
                  }}
                >
                  {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                  {stat.change}
                </div>
              </div>
              <p
                className="text-2xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs mt-1 uppercase tracking-[.1em]"
                style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}
              >
                {stat.title}
              </p>
            </div>
          )
        })}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div
          className="lg:col-span-2 p-6"
          style={{
            background: 'rgba(28,28,28,.3)',
            border: '1px solid rgba(245,240,232,.06)',
          }}
        >
          <h2
            className="text-lg font-light mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
          >
            Actividad Reciente
          </h2>
          <p
            className="text-xs mb-6 uppercase tracking-[.1em]"
            style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}
          >
            Últimos eventos en tu panel
          </p>

          <div className="space-y-6">
            {[
              {
                icon: Package,
                title: 'Configuración inicial completada',
                description: 'Tu panel de administración está listo. Comienza configurando tu contenido.',
                time: 'Ahora',
                accent: '#C9A84C',
              },
              {
                icon: Star,
                title: 'Bienvenido al panel',
                description: 'Explora las funcionalidades del dashboard y personaliza tu landing page.',
                time: 'Inicio',
                accent: '#E8C97A',
              },
            ].map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{
                      border: '1px solid rgba(201,168,76,.1)',
                      background: 'rgba(201,168,76,.05)',
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: activity.accent, strokeWidth: 1.5 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm"
                      style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)' }}
                    >
                      {activity.title}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', lineHeight: '1.6' }}
                    >
                      {activity.description}
                    </p>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-[.08em] flex-shrink-0 mt-0.5"
                    style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}
                  >
                    {activity.time}
                  </span>
                </div>
              )
            })}
          </div>

          {/* CTA Card */}
          <div
            className="mt-8 p-6"
            style={{
              background: 'rgba(201,168,76,.03)',
              border: '1px solid rgba(201,168,76,.1)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3
                  className="text-base font-normal"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
                >
                  ¿Empezamos a configurar?
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.35)', lineHeight: '1.6' }}
                >
                  Agrega tu primer contenido y personaliza tu landing page.
                </p>
              </div>
              <Link href="/dashboard/settings">
                <button
                  className="text-xs uppercase tracking-[.18em] font-medium px-6 py-3 transition-all duration-300 cursor-pointer whitespace-nowrap"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    background: '#C9A84C',
                    color: '#0A0A0A',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#E8C97A')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#C9A84C')}
                >
                  Comenzar
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="p-6"
          style={{
            background: 'rgba(28,28,28,.3)',
            border: '1px solid rgba(245,240,232,.06)',
          }}
        >
          <h2
            className="text-lg font-light mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
          >
            Acciones Rápidas
          </h2>
          <p
            className="text-xs mb-6 uppercase tracking-[.1em]"
            style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}
          >
            Configuración inicial
          </p>

          <div className="space-y-2">
            {[
              { label: 'Agregar Producto', icon: Package, desc: 'Sube tu primer producto', disabled: true },
              { label: 'Ver Landing', icon: TrendingUp, desc: 'Preview en vivo', href: '/' },
              { label: 'Configurar Pagos', icon: DollarSign, desc: 'Métodos de pago', disabled: true },
              { label: 'Mi Perfil', icon: Users, desc: 'Editar información', href: '/dashboard/settings' },
            ].map((action, index) => {
              const Icon = action.icon
              const content = (
                <div
                  className="flex items-center gap-3 p-3 transition-all duration-200"
                  style={{
                    borderLeft: '2px solid transparent',
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!action.disabled) {
                      e.currentTarget.style.borderLeftColor = 'rgba(201,168,76,.3)'
                      e.currentTarget.style.background = 'rgba(245,240,232,.02)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderLeftColor = 'transparent'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                    style={{
                      border: '1px solid rgba(245,240,232,.05)',
                      background: 'rgba(245,240,232,.02)',
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{
                        color: action.disabled ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.4)',
                        strokeWidth: 1.5,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs uppercase tracking-[.08em]"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: action.disabled ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.55)',
                      }}
                    >
                      {action.label}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}
                    >
                      {action.desc}
                    </p>
                  </div>
                  {action.disabled && (
                    <span
                      className="text-[9px] px-1.5 py-0.5"
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
                </div>
              )

              if (action.disabled) {
                return (
                  <div key={index} className="opacity-50">
                    {content}
                  </div>
                )
              }

              return (
                <Link key={index} href={action.href || '#'}>
                  {content}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div
        className="p-6"
        style={{
          background: 'rgba(28,28,28,.3)',
          border: '1px solid rgba(245,240,232,.06)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 flex items-center justify-center"
              style={{
                background: 'rgba(201,168,76,.1)',
                border: '2px solid rgba(201,168,76,.2)',
              }}
            >
              <span
                className="text-lg font-light"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: '#C9A84C',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p
                className="text-sm"
                style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)' }}
              >
                {user?.name}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}
              >
                {user?.email}
              </p>
              <p
                className="text-[10px] mt-1 uppercase tracking-[.08em]"
                style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}
              >
                Rol: {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>
          <Link href="/dashboard/settings">
            <button
              className="text-xs uppercase tracking-[.18em] font-medium px-5 py-2.5 transition-all duration-300 cursor-pointer"
              style={{
                fontFamily: "'Jost', sans-serif",
                background: 'transparent',
                color: 'rgba(245,240,232,.5)',
                border: '1px solid rgba(245,240,232,.12)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'
                e.currentTarget.style.color = '#C9A84C'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,240,232,.12)'
                e.currentTarget.style.color = 'rgba(245,240,232,.5)'
              }}
            >
              Editar Perfil
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
