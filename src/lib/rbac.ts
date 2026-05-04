import { Role } from '@prisma/client'

// ─── Role hierarchy ───────────────────────────────────────
// Higher number = more permissions
const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
}

// ─── Permissions ──────────────────────────────────────────
export const PERMISSIONS = {
  // Dashboard
  dashboard_view: ['viewer', 'editor', 'admin', 'super_admin'] as Role[],

  // Content
  content_view: ['viewer', 'editor', 'admin', 'super_admin'] as Role[],
  content_create: ['editor', 'admin', 'super_admin'] as Role[],
  content_edit: ['editor', 'admin', 'super_admin'] as Role[],
  content_delete: ['admin', 'super_admin'] as Role[],

  // Users
  users_view: ['admin', 'super_admin'] as Role[],
  users_create: ['super_admin'] as Role[],
  users_edit_role: ['super_admin'] as Role[],
  users_deactivate: ['admin', 'super_admin'] as Role[],
  users_delete: ['super_admin'] as Role[],

  // Invites
  invites_create: ['admin', 'super_admin'] as Role[],
  invites_list: ['admin', 'super_admin'] as Role[],
  invites_delete: ['super_admin'] as Role[],

  // Settings
  settings_view: ['admin', 'super_admin'] as Role[],
  settings_edit: ['admin', 'super_admin'] as Role[],

  // Stats
  stats_view: ['viewer', 'editor', 'admin', 'super_admin'] as Role[],
} as const

export type Permission = keyof typeof PERMISSIONS

// ─── Helpers ──────────────────────────────────────────────

export function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY[role] ?? 0
}

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(userRole)
}

export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(userRole, p))
}

export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(userRole, p))
}

// ─── Role labels (Spanish) ────────────────────────────────

export const ROLE_LABELS: Record<Role, string> = {
  viewer: 'Observador',
  editor: 'Editor',
  admin: 'Administrador',
  super_admin: 'Super Administrador',
}

export const ROLE_COLORS: Record<Role, string> = {
  viewer: 'rgba(245,240,232,.5)',
  editor: '#C9A84C',
  admin: '#E8C97A',
  super_admin: '#22c55e',
}

// ─── Route-role map for middleware ─────────────────────────

export const ROUTE_ROLES: Record<string, Role[]> = {
  '/dashboard/users': ['super_admin'],
  '/dashboard/settings': ['admin', 'super_admin'],
  '/dashboard': ['viewer', 'editor', 'admin', 'super_admin'],
}

export function getRequiredRolesForPath(pathname: string): Role[] | null {
  // Check exact matches first
  if (ROUTE_ROLES[pathname]) return ROUTE_ROLES[pathname]

  // Check prefix matches (longest first)
  const sortedRoutes = Object.keys(ROUTE_ROLES).sort((a, b) => b.length - a.length)
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route + '/')) return ROUTE_ROLES[route]
    if (pathname === route) return ROUTE_ROLES[route]
  }

  return null
}
