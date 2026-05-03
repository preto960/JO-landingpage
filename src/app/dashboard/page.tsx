import { auth } from '@/lib/auth'
import DashboardContent from './DashboardContent'

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user

  return <DashboardContent user={user} />
}
