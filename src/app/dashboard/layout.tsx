import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import DashboardShell from './DashboardShell'

// Ensure the visitor_logs table exists (auto-create if missing)
async function ensureVisitorLogsTable() {
  try {
    await db.visitorLog.count()
  } catch {
    // Table doesn't exist — create it with raw SQL
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "visitor_logs" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "ip_address" TEXT NOT NULL DEFAULT '',
          "country" TEXT,
          "city" TEXT,
          "region" TEXT,
          "browser" TEXT,
          "os" TEXT,
          "device" TEXT,
          "page" TEXT NOT NULL DEFAULT '/',
          "referer" TEXT,
          "user_agent" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS "visitor_logs_created_at_idx" ON "visitor_logs"("created_at");
        CREATE INDEX IF NOT EXISTS "visitor_logs_country_idx" ON "visitor_logs"("country");
        CREATE INDEX IF NOT EXISTS "visitor_logs_ip_address_idx" ON "visitor_logs"("ip_address");
      `)
      console.log('[ensureVisitorLogsTable] Table created successfully')
    } catch (err) {
      console.error('[ensureVisitorLogsTable] Error creating table:', err)
    }
  }
}

// Ensure new permissions exist in DB (auto-migration)
async function ensurePermissions() {
  try {
    const perms = [
      { name: 'admin-chat.view', label: 'Ver Chat Admin', module: 'admin-chat', description: 'Permite ver el chat de administradores' },
      { name: 'admin-chat.send', label: 'Enviar Chat Admin', module: 'admin-chat', description: 'Permite enviar mensajes al chat de administradores' },
      { name: 'visitor-logs.view', label: 'Ver Visitor Logs', module: 'visitor-logs', description: 'Permite ver los registros de visitas' },
      { name: 'visitor-logs.delete', label: 'Eliminar Visitor Logs', module: 'visitor-logs', description: 'Permite eliminar registros de visitas' },
      { name: 'appearance.edit', label: 'Editar Apariencia', module: 'appearance', description: 'Permite cambiar el template y apariencia del sitio' },
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
        try {
          await db.rolePermission.create({
            data: { roleId: role.id, permissionId: created.id },
          })
        } catch {
          // Already exists — skip (unique constraint)
        }
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

  // Auto-sync in background (non-blocking)
  ensurePermissions()
  ensureVisitorLogsTable()

  return <DashboardShell user={session.user}>{children}</DashboardShell>
}
