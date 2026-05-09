import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ConfigContent from './ConfigContent'

export default async function ConfigPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect('/login')
  }

  return <ConfigContent user={user} />
}
