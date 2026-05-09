import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import RolesContent from './RolesContent'

export default async function RolesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  if (!session.user.permissions.includes('roles.view')) redirect('/dashboard')

  return <RolesContent user={session.user} />
}
