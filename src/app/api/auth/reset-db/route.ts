import { NextResponse } from 'next/server'

/**
 * POST /api/auth/reset-db
 *
 * NUCLEAR OPTION: Drops ALL tables and recreates them from scratch.
 * - All user data will be lost
 * - Creates RBAC tables with snake_case
 * - Seeds default roles + permissions
 * - Creates a super_admin user with the provided email/password
 *
 * Run ONCE, then DELETE this endpoint.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Se requieren email, password y name' },
        { status: 400 }
      )
    }

    // @ts-ignore
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    async function exec(sql: string) {
      return prisma.$executeRawUnsafe(sql)
    }

    async function query(sql: string) {
      return prisma.$queryRawUnsafe(sql)
    }

    const log: string[] = []

    // ─── 1. DROP ALL TABLES (with CASCADE) ──────────────────
    await exec(`DROP TABLE IF EXISTS role_permissions CASCADE`)
    await exec(`DROP TABLE IF EXISTS audit_logs CASCADE`)
    await exec(`DROP TABLE IF EXISTS invite_codes CASCADE`)
    await exec(`DROP TABLE IF EXISTS sessions CASCADE`)
    await exec(`DROP TABLE IF EXISTS accounts CASCADE`)
    await exec(`DROP TABLE IF EXISTS users CASCADE`)
    await exec(`DROP TABLE IF EXISTS permissions CASCADE`)
    await exec(`DROP TABLE IF EXISTS roles CASCADE`)
    await exec(`DROP TABLE IF EXISTS verification_tokens CASCADE`)
    // Also drop any old PascalCase tables if they still exist
    await exec(`DROP TABLE IF EXISTS "AuditLog" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "InviteCode" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "Session" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "Account" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "User" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "VerificationToken" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "RolePermission" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "Permission" CASCADE`)
    await exec(`DROP TABLE IF EXISTS "Role" CASCADE`)
    // Drop old enum types
    await exec(`DROP TYPE IF EXISTS "Role" CASCADE`)
    log.push('All tables dropped')

    // ─── 2. CREATE TABLES (all snake_case) ───────────────────
    await exec(`CREATE TABLE roles (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`)
    await exec(`CREATE TABLE permissions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      module TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`)
    await exec(`CREATE TABLE role_permissions (
      role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
      permission_id TEXT REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    )`)
    await exec(`CREATE TABLE users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      email_verified TIMESTAMP,
      password TEXT NOT NULL,
      role_id TEXT REFERENCES roles(id),
      image TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_login TIMESTAMP,
      invite_code_id TEXT UNIQUE REFERENCES invite_codes(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`)
    await exec(`CREATE TABLE accounts (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INT,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      CONSTRAINT accounts_provider_provider_account_id_key UNIQUE (provider, provider_account_id)
    )`)
    await exec(`CREATE TABLE sessions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      session_token TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires TIMESTAMP NOT NULL
    )`)
    await exec(`CREATE TABLE verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires TIMESTAMP NOT NULL,
      CONSTRAINT verification_tokens_identifier_token_key UNIQUE (identifier, token)
    )`)
    await exec(`CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`)
    await exec(`CREATE TABLE invite_codes (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      code TEXT UNIQUE NOT NULL,
      role_id TEXT NOT NULL REFERENCES roles(id),
      max_uses INT DEFAULT 1,
      used_count INT DEFAULT 0,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      used_by TEXT REFERENCES users(id) ON DELETE SET NULL
    )`)
    log.push('All tables created fresh with snake_case columns')

    // ─── 3. Seed roles ──────────────────────────────────────
    await exec(`INSERT INTO roles (id, name, label, description) VALUES
      ('role_super_admin', 'super_admin', 'Super Administrador', 'Acceso total al sistema'),
      ('role_admin', 'admin', 'Administrador', 'Gestión de usuarios e invitaciones'),
      ('role_editor', 'editor', 'Editor', 'Acceso a configuración básica'),
      ('role_viewer', 'viewer', 'Observador', 'Solo lectura del dashboard')`)

    // ─── 4. Seed permissions ────────────────────────────────
    await exec(`INSERT INTO permissions (id, name, label, module, description) VALUES
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
      ('perm_audit_view', 'audit.view', 'Ver Auditoría', 'audit', 'Consultar logs')`)

    // ─── 5. Role-permission mappings ────────────────────────
    await exec(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_super_admin', id FROM permissions`)
    await exec(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_admin', id FROM permissions WHERE name NOT IN ('users.delete')`)
    await exec(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_editor', id FROM permissions WHERE name IN ('dashboard.view', 'settings.view', 'settings.edit')`)
    await exec(`INSERT INTO role_permissions (role_id, permission_id)
      SELECT 'role_viewer', id FROM permissions WHERE name IN ('dashboard.view')`)
    log.push('Roles, permissions and mappings seeded')

    // ─── 6. Create super_admin user ─────────────────────────
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    await exec(`INSERT INTO users (name, email, password, email_verified, role_id, is_active) VALUES
      ('${name.replace(/'/g, "''")}', '${email}', '${hashedPassword}', NOW(), 'role_super_admin', true)`)
    log.push(`Super admin created: ${email}`)

    // ─── 7. Verify ──────────────────────────────────────────
    const tables = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `)
    const columns = await query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' ORDER BY ordinal_position
    `)

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Base de datos reseteada completamente',
      steps: log,
      tables: (tables as any[]).map(t => t.table_name),
      userColumns: (columns as any[]).map(c => c.column_name),
    })
  } catch (error: any) {
    console.error('Reset DB error:', error)
    return NextResponse.json(
      { error: 'Error al resetear DB', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
