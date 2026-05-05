import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, image: true, isActive: true, lastLogin: true, createdAt: true,
        role: { select: { name: true, label: true, rolePermissions: { include: { permission: { select: { name: true, label: true, module: true } } } } } },
      },
    })

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    return NextResponse.json({
      user: {
        ...user,
        role: user.role.name,
        permissions: user.role.rolePermissions.map(rp => rp.permission.name),
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
      select: {
        id: true, name: true, email: true,
        role: { select: { name: true, label: true } },
      },
    })

    return NextResponse.json({ user: { ...user, role: user.role.name } })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
