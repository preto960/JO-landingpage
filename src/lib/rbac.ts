import { db } from '@/lib/db'

// ─── Permission names (single source of truth) ───────────
export const PERM = {
  DASHBOARD_VIEW: 'dashboard.view',
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT_ROLE: 'users.edit_role',
  USERS_ACTIVATE: 'users.activate',
  USERS_DELETE: 'users.delete',
  INVITES_VIEW: 'invites.view',
  INVITES_CREATE: 'invites.create',
  INVITES_DELETE: 'invites.delete',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  AUDIT_VIEW: 'audit.view',
} as const

export type PermissionName = (typeof PERM)[keyof typeof PERM]

// ─── Role labels ─────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Observador',
}

export const ROLE_COLORS: Record<string, string> = {
  super_admin: '#22c55e',
  admin: '#E8C97A',
  editor: '#C9A84C',
  viewer: 'rgba(245,240,232,.5)',
}

// ─── Server-side helpers ────────────────────────────────

/** Get all permission names for a user by their role_id */
export async function getUserPermissions(roleId: string): Promise<string[]> {
  const rolePerms = await db.rolePermission.findMany({
    where: { roleId },
    select: { permission: { select: { name: true } } },
  })
  return rolePerms.map(rp => rp.permission.name)
}

/** Check if a role has a specific permission */
export async function hasPermission(roleId: string, permission: string): Promise<boolean> {
  const count = await db.rolePermission.count({
    where: {
      roleId,
      permission: { name: permission },
    },
  })
  return count > 0
}

/** Check if a role has ANY of the given permissions */
export async function hasAnyPermission(roleId: string, permissions: string[]): Promise<boolean> {
  const count = await db.rolePermission.count({
    where: {
      roleId,
      permission: { name: { in: permissions } },
    },
  })
  return count > 0
}

/** Check if a role has ALL of the given permissions */
export async function hasAllPermissions(roleId: string, permissions: string[]): Promise<boolean> {
  const count = await db.rolePermission.count({
    where: {
      roleId,
      permission: { name: { in: permissions } },
    },
  })
  return count === permissions.length
}

// ─── Sync permission check (uses cached array from JWT) ─
export function checkPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission)
}

export function checkAnyPermission(permissions: string[], perms: string[]): boolean {
  return perms.some(p => permissions.includes(p))
}
