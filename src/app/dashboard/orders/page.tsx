import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrdersContent from './OrdersContent'

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  if (!session.user.permissions?.includes('orders.view')) {
    redirect('/dashboard')
  }

  return (
    <OrdersContent
      user={{
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'viewer',
        permissions: session.user.permissions || [],
      }}
    />
  )
}
