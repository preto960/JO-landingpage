import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminChatContent from './AdminChatContent'

export default async function AdminChatPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/dashboard/admin-chat')

  return (
    <AdminChatContent
      user={{
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'viewer',
        permissions: session.user.permissions || [],
      }}
    />
  )
}
