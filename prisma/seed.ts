import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ROLES = [
  { name: 'super_admin', label: 'Super Administrador', description: 'Acceso total al sistema' },
  { name: 'admin', label: 'Administrador', description: 'Gestión de usuarios e invitaciones' },
  { name: 'editor', label: 'Editor', description: 'Acceso a configuración básica' },
  { name: 'viewer', label: 'Observador', description: 'Solo lectura del dashboard' },
]

const PERMISSIONS = [
  // Dashboard
  { name: 'dashboard.view', label: 'Ver Dashboard', module: 'dashboard', description: 'Acceder al dashboard principal' },
  // Users
  { name: 'users.view', label: 'Ver Usuarios', module: 'users', description: 'Ver lista de usuarios' },
  { name: 'users.create', label: 'Crear Usuarios', module: 'users', description: 'Crear nuevos usuarios' },
  { name: 'users.edit_role', label: 'Cambiar Roles', module: 'users', description: 'Modificar el rol de un usuario' },
  { name: 'users.activate', label: 'Activar/Desactivar', module: 'users', description: 'Activar o desactivar cuentas' },
  { name: 'users.delete', label: 'Eliminar Usuarios', module: 'users', description: 'Eliminar cuentas de usuario' },
  // Invites
  { name: 'invites.view', label: 'Ver Invitaciones', module: 'invites', description: 'Ver códigos de invitación' },
  { name: 'invites.create', label: 'Crear Invitaciones', module: 'invites', description: 'Generar nuevos códigos de invitación' },
  { name: 'invites.delete', label: 'Eliminar Invitaciones', module: 'invites', description: 'Eliminar códigos de invitación' },
  // Settings
  { name: 'settings.view', label: 'Ver Configuración', module: 'settings', description: 'Acceder a la página de configuración' },
  { name: 'settings.edit', label: 'Editar Configuración', module: 'settings', description: 'Modificar la configuración' },
  // Audit
  { name: 'audit.view', label: 'Ver Auditoría', module: 'audit', description: 'Consultar logs de auditoría' },
  // Admin Chat
  { name: 'admin-chat.view', label: 'Ver Chat Admin', module: 'admin-chat', description: 'Permite ver el chat de administradores' },
  { name: 'admin-chat.send', label: 'Enviar Chat Admin', module: 'admin-chat', description: 'Permite enviar mensajes al chat de administradores' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map(p => p.name),
  admin: PERMISSIONS.filter(p => !['users.delete'].includes(p.name)).map(p => p.name),
  editor: PERMISSIONS.filter(p => ['dashboard.view', 'settings.view', 'settings.edit'].includes(p.name)).map(p => p.name),
  viewer: ['dashboard.view'],
}

async function main() {
  console.log('Seeding RBAC...\n')

  // ─── Roles ────────────────────────────────────────────────
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { label: role.label, description: role.description },
      create: role,
    })
    console.log(`  Role: ${role.name}`)
  }

  // ─── Permissions ─────────────────────────────────────────
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { label: perm.label, module: perm.module, description: perm.description },
      create: perm,
    })
  }
  console.log(`  Permissions: ${PERMISSIONS.length}\n`)

  // ─── Role-Permission mappings ────────────────────────────
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) continue

    for (const permName of permNames) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } })
      if (!perm) continue

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      })
    }
    console.log(`  ${roleName}: ${permNames.length} permissions`)
  }

  // ─── Test user (super_admin) ────────────────────────────
  const saRole = await prisma.role.findUnique({ where: { name: 'super_admin' } })
  if (saRole) {
    const adminPw = await bcrypt.hash('Admin@1234', 12)
    await prisma.user.upsert({
      where: { email: 'admin@joshop.com' },
      update: {},
      create: {
        name: 'Administrador JO',
        email: 'admin@joshop.com',
        password: adminPw,
        roleId: saRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    })
  }

  console.log('\nSeed completed!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
