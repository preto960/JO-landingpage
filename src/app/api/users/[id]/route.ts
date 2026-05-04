import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { hasMinRole } from '@/lib/rbac'

const updateRoleSchema = z.object({
  role: z.enum(['viewer', 'editor', 'admin', 'super_admin']),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ minRole: 'super_admin' })
  if (!auth.success) return auth.response

  const { id } = await params

  // Can't change own role
  if (id === auth.dbUser.id) {
    return NextResponse.json(
      { error: 'No puedes cambiar tu propio rol' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const result = updateRoleSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true, email: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Can't demote a higher role
    if (!hasMinRole(auth.dbUser.role, targetUser.role as any)) {
      return NextResponse.json(
        { error: 'No puedes modificar un usuario con rol superior al tuyo' },
        { status: 403 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { role: result.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    await createAuditLog({
      userId: auth.dbUser.id,
      action: 'USER_ROLE_CHANGED',
      details: `Changed role of ${targetUser.email} from ${targetUser.role} to ${result.data.role}`,
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
  const auth = await requireAuth({ minRole: 'super_admin' })
  if (!auth.success) return auth.response

  const { id } = await params

  // Can't delete self
  if (id === auth.dbUser.id) {
    return NextResponse.json(
      { error: 'No puedes eliminar tu propia cuenta' },
      { status: 400 }
    )
  }

  try {
    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true, email: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    await createAuditLog({
      userId: auth.dbUser.id,
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
