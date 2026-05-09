import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/roles/sync-permissions — Insert missing permissions into DB
// Call this once after deploying new permission definitions
export async function POST() {
  try {
    const NEW_PERMISSIONS = [
      {
        name: 'admin-chat.view',
        label: 'Ver Chat Admin',
        module: 'admin-chat',
        description: 'Permite ver el chat de administradores',
      },
      {
        name: 'admin-chat.send',
        label: 'Enviar Chat Admin',
        module: 'admin-chat',
        description: 'Permite enviar mensajes al chat de administradores',
      },
    ]

    const results: { name: string; status: string }[] = []

    for (const perm of NEW_PERMISSIONS) {
      // Upsert permission
      const created = await db.permission.upsert({
        where: { name: perm.name },
        update: { label: perm.label, module: perm.module, description: perm.description },
        create: perm,
      })

      // Assign to super_admin and admin roles
      const roles = await db.role.findMany({
        where: { name: { in: ['super_admin', 'admin'] } },
      })

      for (const role of roles) {
        await db.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: created.id },
          },
          update: {},
          create: { roleId: role.id, permissionId: created.id },
        })
      }

      results.push({ name: perm.name, status: 'synced' })
    }

    return NextResponse.json({
      message: 'Permisos sincronizados correctamente',
      results,
    })
  } catch (error: any) {
    console.error('Sync permissions error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
