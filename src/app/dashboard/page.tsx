import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Pedidos',
    value: '0',
    change: '0%',
    trend: 'neutral' as const,
    icon: ShoppingCart,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Clientes',
    value: '0',
    change: '0%',
    trend: 'up' as const,
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Visitas',
    value: '0',
    change: '0%',
    trend: 'neutral' as const,
    icon: Eye,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
]

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Bienvenido, {user?.name?.split(' ')[0] || 'Admin'} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Aquí tienes un resumen general de tu tienda JO-Shop.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Actividad Reciente</CardTitle>
            <CardDescription className="text-gray-500">
              Últimos eventos en tu tienda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  icon: Package,
                  title: 'Configuración inicial completada',
                  description: 'Tu panel de administración está listo. Comienza agregando tus primeros productos.',
                  time: 'Ahora',
                  color: 'text-blue-400',
                  bgColor: 'bg-blue-500/10',
                },
                {
                  icon: Star,
                  title: 'Bienvenido a JO-Shop',
                  description: 'Explora las funcionalidades del dashboard y configura tu tienda online.',
                  time: 'Inicio',
                  color: 'text-yellow-400',
                  bgColor: 'bg-yellow-500/10',
                },
              ].map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">{activity.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">{activity.time}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-medium">¿Empezamos a vender?</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Agrega tus primeros productos y configura los métodos de pago.
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                  Agregar Producto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Acciones Rápidas</CardTitle>
            <CardDescription className="text-gray-500">
              Configuración inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Agregar Producto', icon: Package, desc: 'Sube tu primer producto', disabled: true },
              { label: 'Ver Tienda', icon: TrendingUp, desc: 'Preview en vivo', href: '/' },
              { label: 'Configurar Pagos', icon: DollarSign, desc: 'Métodos de pago', disabled: true },
              { label: 'Mi Perfil', icon: Users, desc: 'Editar información', href: '/dashboard/settings' },
            ].map((action, index) => {
              const Icon = action.icon
              const content = (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${action.disabled ? 'text-gray-500' : 'text-gray-200'}`}>
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-600">{action.desc}</p>
                  </div>
                  {action.disabled && (
                    <span className="text-[10px] bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded">Pronto</span>
                  )}
                </div>
              )

              if (action.disabled) {
                return (
                  <div key={index} className="opacity-50 cursor-not-allowed">
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
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <p className="text-gray-600 text-xs mt-0.5">
                  Rol: {user?.role === 'admin' ? 'Administrador' : 'Usuario'} • Miembro desde hoy
                </p>
              </div>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Editar Perfil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
