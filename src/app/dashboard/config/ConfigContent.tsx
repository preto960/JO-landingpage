'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, ShieldCheck, ChevronRight } from 'lucide-react'
import { PermissionGate } from '@/components/rbac/PermissionGate'

type ConfigCard = {
  title: string
  description: string
  icon: any
  href: string
  permission: string
  accent: string
}

const configCards: ConfigCard[] = [
  {
    title: 'Usuarios',
    description: 'Administrar cuentas de usuario, roles asignados, estados de activacion y permisos individuales.',
    icon: Shield,
    href: '/dashboard/users',
    permission: 'users.view',
    accent: '#6366f1',
  },
  {
    title: 'Roles y Permisos',
    description: 'Definir roles del sistema con permisos granulares para controlar el acceso a cada modulo.',
    icon: ShieldCheck,
    href: '/dashboard/roles',
    permission: 'roles.view',
    accent: '#22c55e',
  },
]

export default function ConfigContent({ user }: { user: { name: string; email: string; role?: string; permissions?: string[] } }) {
  const router = useRouter()
  const permissions = user?.permissions || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-light tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
        >
          Configuracion
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)', letterSpacing: '.03em' }}
        >
          Administra la configuracion general del sistema
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {configCards.map((card) => {
          const hasPermission = permissions.includes(card.permission)
          if (!hasPermission) return null

          return (
            <PermissionGate key={card.href} permission={card.permission}>
              <Link href={card.href} className="group block">
                <div
                  className="h-full p-5 rounded-sm transition-all duration-300"
                  style={{
                    background: 'rgba(245,240,232,.02)',
                    border: '1px solid rgba(245,240,232,.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245,240,232,.04)'
                    e.currentTarget.style.borderColor = `${card.accent}33`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = `0 8px 25px -5px ${card.accent}15`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(245,240,232,.02)'
                    e.currentTarget.style.borderColor = 'rgba(245,240,232,.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
                    style={{
                      background: `${card.accent}10`,
                      border: `1px solid ${card.accent}20`,
                    }}
                  >
                    <card.icon
                      className="w-5 h-5"
                      style={{ color: card.accent, strokeWidth: 1.5 }}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-sm font-medium mb-1.5"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: '#F5F0E8',
                      letterSpacing: '.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-xs leading-relaxed mb-4"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: 'rgba(245,240,232,.35)',
                      letterSpacing: '.02em',
                    }}
                  >
                    {card.description}
                  </p>

                  {/* Arrow */}
                  <div
                    className="flex items-center gap-1"
                    style={{ color: 'rgba(245,240,232,.2)' }}
                  >
                    <span
                      className="text-[10px]"
                      style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '.08em', textTransform: 'uppercase' }}
                    >
                      Entrar
                    </span>
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-transform duration-200"
                      style={{ strokeWidth: 1.5 }}
                    />
                  </div>
                </div>
              </Link>
            </PermissionGate>
          )
        })}
      </div>
    </div>
  )
}
