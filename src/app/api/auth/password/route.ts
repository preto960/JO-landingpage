import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, verifyPassword, hashPassword } from '@/lib/db'

/**
 * POST /api/auth/password
 * TEMPORARY: Reset password by email (no auth required)
 * Remove this after initial setup!
 */
export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email y nueva contraseña son requeridos' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    // Find user by email — try raw query since column names may vary during migration
    let user: any
    try {
      user = await db.user.findUnique({ where: { email } })
    } catch {
      // Fallback: direct SQL
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      const result: any[] = await prisma.$queryRawUnsafe(`SELECT id, email, name FROM users WHERE email = '${email}'`)
      if (result.length === 0) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }
      // Update password via raw SQL
      const bcrypt = await import('bcryptjs')
      const hashed = await bcrypt.hash(newPassword, 12)
      await prisma.$executeRawUnsafe(`UPDATE users SET password = '${hashed}' WHERE email = '${email}'`)
      return NextResponse.json({ message: `Contraseña actualizada para ${email}` })
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const hashedNewPassword = await hashPassword(newPassword)

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    return NextResponse.json({ message: `Contraseña actualizada para ${email}` })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva son requeridas' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const isValidCurrent = await verifyPassword(currentPassword, user.password)
    if (!isValidCurrent) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      )
    }

    const hashedNewPassword = await hashPassword(newPassword)

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        details: 'User changed their password',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
