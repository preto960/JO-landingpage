import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updatePermissionsSchema = z.object({
  permissions: z.array(z.string()).min(0),
})

// PUT /api/roles/[id]/permissions — Set all permissions for a role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: 'roles.manage' })
  if (!auth.success) return auth.response

  const { id } = await params

  try {
    const body = await request.json()
    const result = updatePermissionsSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const role = await db.role.findUnique({ where: { id } })
    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 })
    }

    const { permissions: newPermissionNames } = result.data

    // Validate all permission names exist
    const validPermissions = await db.permission.findMany({
      where: { name: { in: newPermissionNames } },
      select: { id: true, name: true },
    })

    const validNames = new Set(validPermissions.map(p => p.name))
    const invalidNames = newPermissionNames.filter(n => !validNames.has(n))

    if (invalidNames.length > 0) {
      return NextResponse.json(
        { error: 'Permisos inválidos', invalid: invalidNames },
        { status: 400 }
      )
    }

    // Replace all permissions for this role in a transaction
    await db.$transaction(async (tx) => {
      // Remove all current permissions
      await tx.rolePermission.deleteMany({ where: { roleId: id } })

      // Add new permissions
      if (validPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: validPermissions.map(p => ({
            roleId: id,
            permissionId: p.id,
          })),
        })
      }
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'ROLE_PERMISSIONS_UPDATED',
      details: `Permisos actualizados para rol "${role.name}": ${newPermissionNames.length} permisos asignados`,
    })

    return NextResponse.json({
      success: true,
      roleId: id,
      roleName: role.name,
      permissionCount: newPermissionNames.length,
    })
  } catch (error) {
    console.error('Update role permissions error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
