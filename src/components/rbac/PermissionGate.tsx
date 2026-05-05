'use client'

import { usePermissions } from '@/hooks/usePermissions'

type PermissionGateProps = {
  /** Single permission required */
  permission?: string
  /** User needs at least ONE of these permissions */
  any?: string[]
  /** User needs ALL of these permissions */
  all?: string[]
  /** Render this instead of children when access denied */
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * Usage:
 *   <PermissionGate permission="users.view">
 *     <UserList />
 *   </PermissionGate>
 *
 *   <PermissionGate any={["users.create", "users.edit_role"]} fallback={<p>No access</p>}>
 *     <AdminPanel />
 *   </PermissionGate>
 */
export function PermissionGate({ permission, any: anyPerms, all: allPerms, fallback = null, children }: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions()

  if (permission && !can(permission)) return <>{fallback}</>
  if (anyPerms && !canAny(anyPerms)) return <>{fallback}</>
  if (allPerms && !canAll(allPerms)) return <>{fallback}</>

  return <>{children}</>
}
