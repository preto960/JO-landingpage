import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import DashboardShell from './DashboardShell'

// Ensure new permissions exist in DB (auto-migration)
async function ensurePermissions() {
  try {
    const perms = [
      { name: 'admin-chat.view', label: 'Ver Chat Admin', module: 'admin-chat', description: 'Permite ver el chat de administradores' },
      { name: 'admin-chat.send', label: 'Enviar Chat Admin', module: 'admin-chat', description: 'Permite enviar mensajes al chat de administradores' },
    ]
    for (const perm of perms) {
      const created = await db.permission.upsert({
        where: { name: perm.name },
        update: { label: perm.label, module: perm.module, description: perm.description },
        create: perm,
      })
      // Auto-assign to admin roles
      const roles = await db.role.findMany({ where: { name: { in: ['super_admin', 'admin'] } } })
      for (const role of roles) {
        await db.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: created.id } },
          update: {},
          create: { roleId: role.id, permissionId: created.id },
        })
      }
    }
  } catch (err) {
    console.error('[ensurePermissions] Error:', err)
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Auto-sync permissions in background (non-blocking)
  ensurePermissions()

  return <DashboardShell user={session.user}>{children}</DashboardShell>
}
