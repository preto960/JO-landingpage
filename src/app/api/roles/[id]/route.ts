import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateRoleSchema = z.object({
  label: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
})

// GET /api/roles/[id] — Get a single role with permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: 'roles.view' })
  if (!auth.success) return auth.response

  const { id } = await params

  try {
    const role = await db.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
    })

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: role.id,
      name: role.name,
      label: role.label,
      description: role.description,
      userCount: role._count.users,
      permissions: role.rolePermissions.map(rp => rp.permission.name),
    })
  } catch (error) {
    console.error('Get role error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/roles/[id] — Update role info
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: 'roles.manage' })
  if (!auth.success) return auth.response

  const { id } = await params

  try {
    const body = await request.json()
    const result = updateRoleSchema.safeParse(body)
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

    const updated = await db.role.update({
      where: { id },
      data: result.data,
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'ROLE_UPDATED',
      details: `Rol actualizado: ${role.name} -> ${JSON.stringify(result.data)}`,
    })

    return NextResponse.json({ role: updated })
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/roles/[id] — Delete a role (only if no users have it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: 'roles.manage' })
  if (!auth.success) return auth.response

  const { id } = await params

  try {
    const role = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 })
    }

    if (role._count.users > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el rol "${role.label}" porque tiene ${role._count.users} usuario(s) asignado(s)` },
        { status: 400 }
      )
    }

    // Delete role and its permission assignments
    await db.rolePermission.deleteMany({ where: { roleId: id } })
    await db.role.delete({ where: { id } })

    await createAuditLog({
      userId: auth.user.id,
      action: 'ROLE_DELETED',
      details: `Rol eliminado: ${role.name} (${role.label})`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete role error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
