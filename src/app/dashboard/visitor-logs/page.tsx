import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import VisitorLogsContent from './VisitorLogsContent'

export default async function VisitorLogsPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect('/login')
  }

  return <VisitorLogsContent user={user} />
}
