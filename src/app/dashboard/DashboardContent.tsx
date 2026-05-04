'use client'

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
import { ROLE_LABELS, ROLE_COLORS, Role } from '@/lib/rbac'

const stats = [
  { title: 'Ventas Totales', value: '$0', change: '0%', trend: 'up' as const, icon: DollarSign, accent: '#22c55e' },
  { title: 'Pedidos', value: '0', change: '0%', trend: 'neutral' as const, icon: ShoppingCart, accent: '#C9A84C' },
  { title: 'Clientes', value: '0', change: '0%', trend: 'up' as const, icon: Users, accent: '#a78bfa' },
  { title: 'Visitas', value: '0', change: '0%', trend: 'neutral' as const, icon: Eye, accent: '#fb923c' },
]

const cardStyle: React.CSSProperties = {
  background: 'rgba(28,28,28,.3)',
  border: '1px solid rgba(245,240,232,.06)',
}

const btnGold: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '.78rem',
  fontWeight: 500,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  padding: '.75rem 1.5rem',
  background: '#C9A84C',
  color: '#0A0A0A',
  border: 'none',
  borderRadius: 0,
  cursor: 'pointer',
  transition: 'background .3s, transform .1s',
  textDecoration: 'none',
  display: 'inline-block',
}

const btnOutline: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '.78rem',
  fontWeight: 500,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  padding: '.625rem 1.25rem',
  background: 'transparent',
  color: 'rgba(245,240,232,.5)',
  border: '1px solid rgba(245,240,232,.12)',
  borderRadius: 0,
  cursor: 'pointer',
  transition: 'all .3s',
  textDecoration: 'none',
  display: 'inline-block',
}

export default function DashboardContent({
  user,
}: {
  user: { name?: string | null; email?: string | null; role?: string | null; image?: string | null; id?: string } | undefined
}) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Welcome */}
      <div>
        <h1 className="text-[1.5rem] sm:text-[1.875rem] lg:text-[2rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>
          Bienvenido, <span style={{ color: '#C9A84C' }}>{user?.name?.split(' ')[0] || 'Admin'}</span>
        </h1>
        <p className="text-[.8rem] sm:text-[.85rem]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)', marginTop: '.5rem' }}>
          Aquí tienes un resumen general de tu panel de administración.
        </p>
      </div>

      {/* Gold divider */}
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)' }} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="p-3 sm:p-4 lg:p-5" style={{ ...cardStyle, transition: 'all .3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.15)'; e.currentTarget.style.background = 'rgba(28,28,28,.5)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,240,232,.06)'; e.currentTarget.style.background = 'rgba(28,28,28,.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                <div className="w-9 h-9 sm:w-10 sm:h-10" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,240,232,.06)', background: 'rgba(245,240,232,.03)' }}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.accent, strokeWidth: 1.5 }} />
                </div>
                <div className="hidden sm:flex" style={{ alignItems: 'center', fontFamily: "'Jost', sans-serif", fontSize: '.75rem', fontWeight: 500, color: stat.trend === 'up' ? 'rgba(34,197,94,.7)' : 'rgba(245,240,232,.2)' }}>
                  {stat.trend === 'up' && <ArrowUpRight style={{ width: '.75rem', height: '.75rem', marginRight: '.125rem' }} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-[1.25rem] sm:text-[1.5rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>{stat.value}</p>
              <p className="text-[.6rem] sm:text-[.7rem]" style={{ fontFamily: "'Jost', sans-serif", textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.3)', marginTop: '.25rem' }}>{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

        {/* Activity */}
        <div className="lg:col-span-2 p-4 sm:p-6" style={{ ...cardStyle }}>
          <h2 className="text-base sm:text-[1.125rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: '0 0 .25rem' }}>Actividad Reciente</h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)', marginBottom: '1.25rem' }}>Últimos eventos en tu panel</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: Package, title: 'Configuración inicial completada', description: 'Tu panel de administración está listo. Comienza configurando tu contenido.', time: 'Ahora', accent: '#C9A84C' },
              { icon: Star, title: 'Bienvenido al panel', description: 'Explora las funcionalidades del dashboard y personaliza tu landing page.', time: 'Inicio', accent: '#E8C97A' },
            ].map((activity, i) => {
              const Icon = activity.icon
              return (
                <div key={i} className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,.1)', background: 'rgba(201,168,76,.05)' }}>
                    <Icon className="w-4 h-4" style={{ color: activity.accent, strokeWidth: 1.5 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[.8rem] sm:text-[.85rem]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)', margin: 0 }}>{activity.title}</p>
                      <span className="hidden sm:block flex-shrink-0" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(245,240,232,.2)' }}>{activity.time}</span>
                    </div>
                    <p className="text-[.75rem] sm:text-[.8rem]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', margin: '.25rem 0 0', lineHeight: 1.6 }}>{activity.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-5 sm:mt-8 p-3.5 sm:p-6" style={{ background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.1)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-[.95rem] sm:text-[1rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', margin: 0 }}>¿Empezamos a configurar?</h3>
                <p className="text-[.75rem] sm:text-[.8rem]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.35)', marginTop: '.25rem', lineHeight: 1.6 }}>Agrega tu primer contenido y personaliza tu landing page.</p>
              </div>
              <Link href="/dashboard/settings" className="w-full sm:w-auto text-center" style={{ ...btnGold, whiteSpace: 'nowrap' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#E8C97A')} onMouseLeave={(e) => (e.currentTarget.style.background = '#C9A84C')}>
                Comenzar
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 sm:p-6" style={{ ...cardStyle }}>
          <h2 className="text-base sm:text-[1.125rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: '0 0 .25rem' }}>Acciones Rápidas</h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)', marginBottom: '1.25rem' }}>Configuración inicial</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[
              { label: 'Agregar Producto', icon: Package, desc: 'Sube tu primer producto', disabled: true },
              { label: 'Ver Landing', icon: TrendingUp, desc: 'Preview en vivo', href: '/' },
              { label: 'Configurar Pagos', icon: DollarSign, desc: 'Métodos de pago', disabled: true },
              { label: 'Mi Perfil', icon: Users, desc: 'Editar información', href: '/dashboard/settings' },
            ].map((action, i) => {
              const Icon = action.icon
              const content = (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem', borderLeft: '2px solid transparent', cursor: action.disabled ? 'not-allowed' : 'pointer', transition: 'all .2s' }} onMouseEnter={(e) => { if (!action.disabled) { e.currentTarget.style.borderLeftColor = 'rgba(201,168,76,.3)'; e.currentTarget.style.background = 'rgba(245,240,232,.02)' } }} onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(245,240,232,.05)', background: 'rgba(245,240,232,.02)' }}>
                    <Icon style={{ width: '1rem', height: '1rem', color: action.disabled ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.4)', strokeWidth: 1.5 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.08em', color: action.disabled ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.55)', margin: 0 }}>{action.label}</p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', color: 'rgba(245,240,232,.2)', marginTop: '.125rem' }}>{action.desc}</p>
                  </div>
                  {action.disabled && (
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.55rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,.2)', background: 'rgba(245,240,232,.03)', padding: '.125rem .375rem' }}>Pronto</span>
                  )}
                </div>
              )

              if (action.disabled) {
                return <div key={i} style={{ opacity: 0.5 }}>{content}</div>
              }
              return <Link key={i} href={action.href || '#'} style={{ textDecoration: 'none' }}>{content}</Link>
            })}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3.5 sm:p-6" style={{ ...cardStyle }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,.1)', border: '2px solid rgba(201,168,76,.2)' }}>
              <span className="text-sm sm:text-[1.125rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#C9A84C' }}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[.8rem] sm:text-[.85rem] truncate" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)', margin: 0 }}>{user?.name}</p>
              <p className="text-[.75rem] sm:text-[.8rem] truncate" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', margin: '.125rem 0' }}>{user?.email}</p>
              <span className="inline-block px-1.5 py-0.5 mt-1" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.08em', color: ROLE_COLORS[(user?.role as Role) || 'viewer'], background: 'rgba(201,168,76,.05)' }}>{ROLE_LABELS[(user?.role as Role) || 'viewer']}</span>
            </div>
          </div>
          <Link href="/dashboard/settings" className="w-full sm:w-auto text-center" style={btnOutline} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; e.currentTarget.style.color = '#C9A84C' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,240,232,.12)'; e.currentTarget.style.color = 'rgba(245,240,232,.5)' }}>
            Editar Perfil
          </Link>
        </div>
      </div>
    </div>
  )
}
