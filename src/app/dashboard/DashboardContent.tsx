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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: '#F5F0E8', margin: 0 }}>
          Bienvenido, <span style={{ color: '#C9A84C' }}>{user?.name?.split(' ')[0] || 'Admin'}</span>
        </h1>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.4)', marginTop: '.5rem' }}>
          Aquí tienes un resumen general de tu panel de administración.
        </p>
      </div>

      {/* Gold divider */}
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)' }} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} style={{ ...cardStyle, padding: '1.25rem', transition: 'all .3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.15)'; e.currentTarget.style.background = 'rgba(28,28,28,.5)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,240,232,.06)'; e.currentTarget.style.background = 'rgba(28,28,28,.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,240,232,.06)', background: 'rgba(245,240,232,.03)' }}>
                  <Icon style={{ width: '1.25rem', height: '1.25rem', color: stat.accent, strokeWidth: 1.5 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontFamily: "'Jost', sans-serif", fontSize: '.75rem', fontWeight: 500, color: stat.trend === 'up' ? 'rgba(34,197,94,.7)' : 'rgba(245,240,232,.2)' }}>
                  {stat.trend === 'up' && <ArrowUpRight style={{ width: '.75rem', height: '.75rem', marginRight: '.125rem' }} />}
                  {stat.change}
                </div>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 300, color: '#F5F0E8', margin: 0 }}>{stat.value}</p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.3)', marginTop: '.25rem' }}>{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Activity + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

        {/* Activity */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 300, color: '#F5F0E8', margin: '0 0 .25rem' }}>Actividad Reciente</h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)', marginBottom: '1.5rem' }}>Últimos eventos en tu panel</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { icon: Package, title: 'Configuración inicial completada', description: 'Tu panel de administración está listo. Comienza configurando tu contenido.', time: 'Ahora', accent: '#C9A84C' },
              { icon: Star, title: 'Bienvenido al panel', description: 'Explora las funcionalidades del dashboard y personaliza tu landing page.', time: 'Inicio', accent: '#E8C97A' },
            ].map((activity, i) => {
              const Icon = activity.icon
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(201,168,76,.1)', background: 'rgba(201,168,76,.05)' }}>
                    <Icon style={{ width: '1rem', height: '1rem', color: activity.accent, strokeWidth: 1.5 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.7)', margin: 0 }}>{activity.title}</p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.8rem', color: 'rgba(245,240,232,.3)', margin: '.25rem 0 0', lineHeight: 1.6 }}>{activity.description}</p>
                  </div>
                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(245,240,232,.2)', flexShrink: 0 }}>{activity.time}</span>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 400, color: '#F5F0E8', margin: 0 }}>¿Empezamos a configurar?</h3>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.8rem', color: 'rgba(245,240,232,.35)', marginTop: '.25rem', lineHeight: 1.6 }}>Agrega tu primer contenido y personaliza tu landing page.</p>
              </div>
              <Link href="/dashboard/settings" style={{ ...btnGold, whiteSpace: 'nowrap' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#E8C97A')} onMouseLeave={(e) => (e.currentTarget.style.background = '#C9A84C')}>
                Comenzar
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 300, color: '#F5F0E8', margin: '0 0 .25rem' }}>Acciones Rápidas</h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)', marginBottom: '1.5rem' }}>Configuración inicial</p>

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
      <div style={{ ...cardStyle, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,.1)', border: '2px solid rgba(201,168,76,.2)' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 300, color: '#C9A84C' }}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.7)', margin: 0 }}>{user?.name}</p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.8rem', color: 'rgba(245,240,232,.3)', margin: '.125rem 0' }}>{user?.email}</p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(245,240,232,.2)', marginTop: '.125rem' }}>Rol: {user?.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
            </div>
          </div>
          <Link href="/dashboard/settings" style={btnOutline} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; e.currentTarget.style.color = '#C9A84C' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,240,232,.12)'; e.currentTarget.style.color = 'rgba(245,240,232,.5)' }}>
            Editar Perfil
          </Link>
        </div>
      </div>
    </div>
  )
}
