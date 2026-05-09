import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateRoleSchema = z.object({
  roleId: z.string().min(1),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: 'users.edit_role' })
  if (!auth.success) return auth.response

  const { id } = await params

  if (id === auth.user.id) {
    return NextResponse.json({ error: 'No puedes cambiar tu propio rol' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const result = updateRoleSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: { select: { name: true } }, name: true, email: true },
    })
    if (!targetUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const newRole = await db.role.findUnique({ where: { id: result.data.roleId } })
    if (!newRole) return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 })

    const updatedUser = await db.user.update({
      where: { id },
      data: { roleId: result.data.roleId },
      select: {
        id: true, name: true, email: true,
        role: { select: { name: true, label: true } },
        isActive: true,
      },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'USER_ROLE_CHANGED',
      details: `Changed role of ${targetUser.email} from ${targetUser.role.name} to ${newRole.name}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: 'users.delete' })
  if (!auth.success) return auth.response

  const { id } = await params

  if (id === auth.user.id) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })
  }

  try {
    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: { select: { name: true } }, name: true, email: true },
    })
    if (!targetUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    await db.user.delete({ where: { id } })

    await createAuditLog({
      userId: auth.user.id,
      action: 'USER_DELETED',
      details: `Deleted user: ${targetUser.email}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
