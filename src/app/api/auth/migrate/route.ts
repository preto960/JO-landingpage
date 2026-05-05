import { NextResponse } from 'next/server'

/**
 * POST /api/auth/migrate
 *
 * Idempotent one-time migration:
 * 1. Creates RBAC tables (roles, permissions, role_permissions)
 * 2. Seeds default roles + permissions + mappings
 * 3. Renames existing tables to snake_case
 * 4. Adds missing columns to users
 * 5. Migrates role data (enum/text → FK)
 * 6. Promotes existing users to super_admin
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
        // Table might already be renamed or not exist
      }
    }

    // ─── 6. Add/fix columns on users ───────────────────────
    const userCols = await getColumns('users')

    if (!userCols.includes('role_id')) {
      if (userCols.includes('role')) {
        await q(`ALTER TABLE users ADD COLUMN role_id TEXT DEFAULT 'role_viewer' REFERENCES roles(id)`)
        await q(`UPDATE users SET role_id = CASE
          WHEN role = 'super_admin' THEN 'role_super_admin'
          WHEN role = 'admin' THEN 'role_admin'
          WHEN role = 'editor' THEN 'role_editor'
          ELSE 'role_viewer'
        END`)
        await safeQ(`ALTER TABLE users DROP COLUMN role`)
        await safeQ(`DROP TYPE IF EXISTS "Role"`)
        log.push('Migrated role enum -> role_id FK')
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
      if (userCols.includes('invitecodeid') || userCols.includes('"inviteCodeId"')) {
        await safeQ(`ALTER TABLE users RENAME COLUMN "inviteCodeId" TO invite_code_id`)
      } else {
        await safeQ(`ALTER TABLE users ADD COLUMN invite_code_id TEXT UNIQUE REFERENCES invite_codes(id) ON DELETE SET NULL`)
      }
    }

    // ─── 7. Fix snake_case column names on users ────────────
    const userColsAfter = await getColumns('users')
    const colRenames: [string, string][] = [
      ['emailverified', 'email_verified'],
      ['emailVerified', 'email_verified'],
      ['createdat', 'created_at'],
      ['createdAt', 'created_at'],
      ['updatedat', 'updated_at'],
      ['updatedAt', 'updated_at'],
      ['lastlogin', 'last_login'],
    ]
    for (const [old, newName] of colRenames) {
      if (userColsAfter.includes(old.toLowerCase()) && !userColsAfter.includes(newName)) {
        await safeQ(`ALTER TABLE users RENAME COLUMN "${old}" TO ${newName}`)
      }
    }

    // ─── 8. Fix invite_codes table ─────────────────────────
    try {
      const invCols = await getColumns('invite_codes')
      if (invCols.length > 0 && !invCols.includes('role_id')) {
        if (invCols.includes('role')) {
          await q(`ALTER TABLE invite_codes ADD COLUMN role_id TEXT REFERENCES roles(id)`)
          await q(`UPDATE invite_codes SET role_id = CASE
            WHEN role = 'super_admin' THEN 'role_super_admin'
            WHEN role = 'admin' THEN 'role_admin'
            WHEN role = 'editor' THEN 'role_editor'
            ELSE 'role_viewer'
          END`)
          await safeQ(`ALTER TABLE invite_codes DROP COLUMN role`)
          log.push('Migrated invite_codes role -> role_id FK')
        } else {
          await q(`ALTER TABLE invite_codes ADD COLUMN role_id TEXT REFERENCES roles(id)`)
        }
      }

      const invColsAfter = await getColumns('invite_codes')
      const invRenames: [string, string][] = [
        ['maxuses', 'max_uses'], ['maxUses', 'max_uses'],
        ['usedcount', 'used_count'], ['usedCount', 'used_count'],
        ['expiresat', 'expires_at'], ['expiresAt', 'expires_at'],
        ['createdat', 'created_at'], ['createdAt', 'created_at'],
        ['createdby', 'created_by'], ['createdBy', 'created_by'],
        ['invitecodeid', 'invite_code_id'],
      ]
      for (const [old, newName] of invRenames) {
        if (invColsAfter.map(c => c.toLowerCase()).includes(old.toLowerCase()) && !invColsAfter.includes(newName)) {
          await safeQ(`ALTER TABLE invite_codes RENAME COLUMN "${old}" TO ${newName}`)
        }
      }
    } catch {
      log.push('invite_codes table not found, skipping')
    }

    // ─── 9. Fix audit_logs columns ─────────────────────────
    try {
      const alCols = await getColumns('audit_logs')
      if (alCols.length > 0) {
        const alRenames: [string, string][] = [
          ['userid', 'user_id'], ['userId', 'user_id'],
          ['ipaddress', 'ip_address'], ['ipAddress', 'ip_address'],
          ['createdat', 'created_at'], ['createdAt', 'created_at'],
        ]
        for (const [old, newName] of alRenames) {
          if (alCols.map(c => c.toLowerCase()).includes(old.toLowerCase()) && !alCols.includes(newName)) {
            await safeQ(`ALTER TABLE audit_logs RENAME COLUMN "${old}" TO ${newName}`)
          }
        }
      }
    } catch {}

    // ─── 10. Promote user ──────────────────────────────────
    if (promoteEmail) {
      await q(`UPDATE users SET role_id = 'role_super_admin' WHERE email = $1`, [promoteEmail])
      log.push(`Promoted ${promoteEmail} to super_admin`)
    } else {
      await q(`UPDATE users SET role_id = 'role_super_admin' WHERE role_id NOT IN (SELECT id FROM roles)`)
      log.push('All unmapped users promoted to super_admin')
    }

    // ─── 11. Verify ────────────────────────────────────────
    // Re-read columns after all renames to know which names to use
    const finalCols = await getColumns('users')
    const hasCreatedAt = finalCols.includes('created_at')
    const hasIsActive = finalCols.includes('is_active')

    const users = await q(`
      SELECT u.id, u.email, u.name${hasIsActive ? ', u.is_active' : ''}, r.name as role_name, r.label as role_label
      FROM users u LEFT JOIN roles r ON u.role_id = r.id
      ${hasCreatedAt ? 'ORDER BY u.created_at ASC' : ''}
    `)

    return NextResponse.json({
      success: true,
      message: 'Migración RBAC completada',
      steps: log,
      users: users.rows || users,
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Error en migración', details: error.message, stack: error.stack }, { status: 500 })
  }
}

// Check status
export async function GET() {
  try {
    const tables = await q(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    const userCols = await getColumns('users')

    return NextResponse.json({
      tables: (tables.rows || tables).map((t: any) => t.table_name || t.table_name),
      userColumns: userCols,
      hasRbacTables: ['roles', 'permissions', 'role_permissions'].every(t =>
        (tables.rows || tables).some((tb: any) => (tb.table_name || tb.table_name) === t)
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

async function safeQ(sql: string) {
  try { await prisma.$executeRawUnsafe(sql) } catch {}
}
