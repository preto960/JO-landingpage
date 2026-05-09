import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: 'users.activate' })
  if (!auth.success) return auth.response

  const { id } = await params

  if (id === auth.user.id) {
    return NextResponse.json({ error: 'No puedes desactivar tu propia cuenta' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: { select: { name: true } }, isActive: true, name: true, email: true },
    })
    if (!targetUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const updatedUser = await db.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true, name: true, email: true,
        role: { select: { name: true, label: true } },
        isActive: true,
      },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      details: `${isActive ? 'Activated' : 'Deactivated'} user: ${targetUser.email}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Toggle active error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
