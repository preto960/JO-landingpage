'use client'

import { useSession } from 'next-auth/react'

export function usePermissions() {
  const { data: session } = useSession()
  const permissions: string[] = (session?.user as any)?.permissions || []

  const can = (permission: string) => permissions.includes(permission)

  const canAny = (perms: string[]) => perms.some(p => permissions.includes(p))

  const canAll = (perms: string[]) => perms.every(p => permissions.includes(p))

  const roleName = (session?.user as any)?.role || 'viewer'

  return { permissions, can, canAny, canAll, roleName }
}
