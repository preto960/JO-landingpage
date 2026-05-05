import { NextResponse } from 'next/server'

/**
 * POST /api/auth/migrate
 *
 * Idempotent migration:
 * 1. Creates RBAC tables + seeds data
 * 2. Renames tables to snake_case
 * 3. Adds missing columns to users
 * 4. Renames columns to snake_case (case-insensitive lookup)
 * 5. Promotes existing users to super_admin
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const promoteEmail = body.email as string | undefined
    const log: string[] = []

    // ─── 1. Create RBAC tables ──────────────────────────────
    await q(`CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`)
    await q(`CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      module TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`)
    await q(`CREATE TABLE IF NOT EXISTS role_permissions (
      role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
      permission_id TEXT REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    )`)
    log.push('RBAC tables created/verified')

    // ─── 2. Seed roles ──────────────────────────────────────
    await q(`INSERT INTO roles (id, name, label, description) VALUES
      ('role_super_admin', 'super_admin', 'Super Administrador', 'Acceso total al sistema'),
      ('role_admin', 'admin', 'Administrador', 'Gestión de usuarios e invitaciones'),
      ('role_editor', 'editor', 'Editor', 'Acceso a configuración básica'),
      ('role_viewer', 'viewer', 'Observador', 'Solo lectura del dashboard')
    ON CONFLICT (name) DO NOTHING`)

    // ─── 3. Seed permissions ────────────────────────────────
    await q(`INSERT INTO permissions (id, name, label, module, description) VALUES
      ('perm_dashboard_view', 'dashboard.view', 'Ver Dashboard', 'dashboard', 'Acceder al dashboard principal'),
      ('perm_users_view', 'users.view', 'Ver Usuarios', 'users', 'Ver lista de usuarios'),
      ('perm_users_create', 'users.create', 'Crear Usuarios', 'users', 'Crear nuevos usuarios'),
      ('perm_users_edit_role', 'users.edit_role', 'Cambiar Roles', 'users', 'Modificar el rol de un usuario'),
      ('perm_users_activate', 'users.activate', 'Activar/Desactivar', 'users', 'Activar o desactivar cuentas'),
      ('perm_users_delete', 'users.delete', 'Eliminar Usuarios', 'users', 'Eliminar cuentas de usuario'),
      ('perm_invites_view', 'invites.view', 'Ver Invitaciones', 'invites', 'Ver códigos de invitación'),
      ('perm_invites_create', 'invites.create', 'Crear Invitaciones', 'invites', 'Generar nuevos códigos'),
      ('perm_invites_delete', 'invites.delete', 'Eliminar Invitaciones', 'invites', 'Eliminar códigos'),
      ('perm_settings_view', 'settings.view', 'Ver Configuración', 'settings', 'Acceder a configuración'),
      ('perm_settings_edit', 'settings.edit', 'Editar Configuración', 'settings', 'Modificar configuración'),
      ('perm_audit_view', 'audit.view', 'Ver Auditoría', 'audit', 'Consultar logs')
    ON CONFLICT (name) DO NOTHING`)

    // ─── 4. Role-permission mappings ────────────────────────
    await q(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_super_admin', id FROM permissions
      ON CONFLICT DO NOTHING`)
    await q(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_admin', id FROM permissions WHERE name NOT IN ('users.delete')
      ON CONFLICT DO NOTHING`)
    await q(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_editor', id FROM permissions WHERE name IN ('dashboard.view', 'settings.view', 'settings.edit')
      ON CONFLICT DO NOTHING`)
    await q(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_viewer', id FROM permissions WHERE name IN ('dashboard.view')
      ON CONFLICT DO NOTHING`)
    log.push('Roles, permissions and mappings seeded')

    // ─── 5. Rename existing tables to snake_case ────────────
    const renames: [string, string][] = [
      ['"User"', 'users'], ['"Account"', 'accounts'], ['"Session"', 'sessions'],
      ['"VerificationToken"', 'verification_tokens'],
      ['"AuditLog"', 'audit_logs'], ['"InviteCode"', 'invite_codes'],
    ]
    for (const [oldName, newName] of renames) {
      try {
        await q(`ALTER TABLE ${oldName} RENAME TO ${newName}`)
        log.push(`Renamed ${oldName} -> ${newName}`)
      } catch {
        // Table already renamed or doesn't exist
      }
    }

    // ─── 6. Add missing columns on users ────────────────────
    const userCols = await getColumns('users')

    if (!userCols.includes('role_id')) {
      if (userCols.find(c => c.toLowerCase() === 'role')) {
        await q(`ALTER TABLE users ADD COLUMN role_id TEXT DEFAULT 'role_viewer' REFERENCES roles(id)`)
        await q(`UPDATE users SET role_id = CASE
          WHEN role::text = 'super_admin' THEN 'role_super_admin'
          WHEN role::text = 'admin' THEN 'role_admin'
          WHEN role::text = 'editor' THEN 'role_editor'
          ELSE 'role_viewer'
        END`)
        await safeQ(`ALTER TABLE users DROP COLUMN role`)
        await safeQ(`DROP TYPE IF EXISTS "Role"`)
        log.push('Migrated role -> role_id FK')
      } else {
        await q(`ALTER TABLE users ADD COLUMN role_id TEXT DEFAULT 'role_viewer' REFERENCES roles(id)`)
        log.push('Added role_id column')
      }
    }

    if (!userCols.includes('is_active')) {
      await safeQ(`ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true`)
      log.push('Added is_active')
    }
    if (!userCols.includes('last_login')) {
      await safeQ(`ALTER TABLE users ADD COLUMN last_login TIMESTAMP(3)`)
      log.push('Added last_login')
    }
    if (!userCols.includes('invite_code_id')) {
      const invCol = userCols.find(c => c.toLowerCase() === 'invitecodeid')
      if (invCol) {
        await safeQ(`ALTER TABLE users RENAME COLUMN "${invCol}" TO invite_code_id`)
      } else {
        await safeQ(`ALTER TABLE users ADD COLUMN invite_code_id TEXT UNIQUE REFERENCES invite_codes(id) ON DELETE SET NULL`)
      }
    }

    // ─── 7. Rename camelCase columns to snake_case on users ─
    const userColsAfter = await getColumns('users')
    await renameColumn('users', userColsAfter, 'emailverified', 'email_verified', log)
    await renameColumn('users', userColsAfter, 'createdat', 'created_at', log)
    await renameColumn('users', userColsAfter, 'updatedat', 'updated_at', log)

    // ─── 8. Fix invite_codes table ─────────────────────────
    try {
      const invCols = await getColumns('invite_codes')
      if (invCols.length > 0) {
        if (!invCols.includes('role_id')) {
          if (invCols.find(c => c.toLowerCase() === 'role')) {
            await q(`ALTER TABLE invite_codes ADD COLUMN role_id TEXT REFERENCES roles(id)`)
            await q(`UPDATE invite_codes SET role_id = CASE
              WHEN role::text = 'super_admin' THEN 'role_super_admin'
              WHEN role::text = 'admin' THEN 'role_admin'
              WHEN role::text = 'editor' THEN 'role_editor'
              ELSE 'role_viewer'
            END`)
            await safeQ(`ALTER TABLE invite_codes DROP COLUMN role`)
            log.push('Migrated invite_codes role -> role_id FK')
          } else {
            await q(`ALTER TABLE invite_codes ADD COLUMN role_id TEXT REFERENCES roles(id)`)
          }
        }
        const invColsAfter = await getColumns('invite_codes')
        await renameColumn('invite_codes', invColsAfter, 'maxuses', 'max_uses', log)
        await renameColumn('invite_codes', invColsAfter, 'usedcount', 'used_count', log)
        await renameColumn('invite_codes', invColsAfter, 'expiresat', 'expires_at', log)
        await renameColumn('invite_codes', invColsAfter, 'createdat', 'created_at', log)
        await renameColumn('invite_codes', invColsAfter, 'createdby', 'created_by', log)
        await renameColumn('invite_codes', invColsAfter, 'invitecodeid', 'invite_code_id', log)
      }
    } catch {
      log.push('invite_codes table not found, skipping')
    }

    // ─── 9. Fix audit_logs columns ─────────────────────────
    try {
      const alCols = await getColumns('audit_logs')
      if (alCols.length > 0) {
        await renameColumn('audit_logs', alCols, 'userid', 'user_id', log)
        await renameColumn('audit_logs', alCols, 'ipaddress', 'ip_address', log)
        await renameColumn('audit_logs', alCols, 'createdat', 'created_at', log)
      }
    } catch {}

    // ─── 10. Promote user ──────────────────────────────────
    if (promoteEmail) {
      await q(`UPDATE users SET role_id = 'role_super_admin' WHERE email = $1`, [promoteEmail])
      log.push(`Promoted ${promoteEmail} to super_admin`)
    } else {
      await q(`UPDATE users SET role_id = 'role_super_admin' WHERE role_id IS NULL OR role_id NOT IN (SELECT id FROM roles)`)
      log.push('All unmapped users promoted to super_admin')
    }

    // ─── 11. Verify ────────────────────────────────────────
    const finalCols = await getColumns('users')
    const users = await q(`
      SELECT u.id, u.email, u.name, r.name as role_name, r.label as role_label
      FROM users u LEFT JOIN roles r ON u.role_id = r.id
    `)

    return NextResponse.json({
      success: true,
      message: 'Migración RBAC completada',
      steps: log,
      userColumns: finalCols,
      users: users.rows || users,
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Error en migración', details: error.message, stack: error.stack }, { status: 500 })
  }
}

export async function GET() {
  try {
    const tables = await q(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    const userCols = await getColumns('users')

    return NextResponse.json({
      tables: (tables.rows || tables).map((t: any) => t.table_name),
      userColumns: userCols,
      hasRbacTables: ['roles', 'permissions', 'role_permissions'].every(t =>
        (tables.rows || tables).some((tb: any) => tb.table_name === t)
      ),
      needsMigration: !userCols.includes('role_id'),
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'No se pudo verificar', details: error.message }, { status: 500 })
  }
}

// ─── Helpers ──────────────────────────────────────────────

// @ts-ignore
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function q(sql: string, params?: any[]) {
  if (params?.length) {
    return prisma.$executeRawUnsafe(sql.replace(/\$1/g, `'${params[0]}'`))
  }
  return prisma.$queryRawUnsafe(sql)
}

async function getColumns(table: string): Promise<string[]> {
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position`
    ) as { column_name: string }[]
    return result.map(r => r.column_name)
  } catch {
    return []
  }
}

/**
 * Rename a column in a table (case-insensitive match).
 * Finds the actual column name from the DB and uses it in ALTER TABLE.
 */
async function renameColumn(
  table: string,
  existingCols: string[],
  oldName: string,
  newName: string,
  log: string[]
) {
  // Skip if target name already exists
  if (existingCols.includes(newName)) return
  // Find actual column name (case-insensitive)
  const actualCol = existingCols.find(c => c.toLowerCase() === oldName.toLowerCase())
  if (!actualCol) return
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE ${table} RENAME COLUMN "${actualCol}" TO ${newName}`)
    log.push(`Renamed ${table}.${actualCol} -> ${newName}`)
  } catch (e: any) {
    log.push(`WARN: Could not rename ${table}.${actualCol} -> ${newName}: ${e.message}`)
  }
}

async function safeQ(sql: string) {
  try { await prisma.$executeRawUnsafe(sql) } catch {}
}
