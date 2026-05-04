import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsersContent from './UsersContent'

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return <UsersContent user={session.user} />
}
