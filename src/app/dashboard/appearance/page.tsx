import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AppearanceContent from './AppearanceContent'

export default async function AppearancePage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect('/login')
  }

  return <AppearanceContent user={user} />
}
