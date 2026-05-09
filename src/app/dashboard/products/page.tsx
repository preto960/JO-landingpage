import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProductsContent from './ProductsContent'

export default async function ProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Check products.view permission
  if (!session.user.permissions?.includes('products.view')) {
    redirect('/dashboard')
  }

  return (
    <ProductsContent
      user={{
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'viewer',
        permissions: session.user.permissions || [],
      }}
    />
  )
}
