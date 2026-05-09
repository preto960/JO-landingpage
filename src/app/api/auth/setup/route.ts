import { NextResponse } from 'next/server'
import { db, hashPassword } from '@/lib/db'
import { z } from 'zod'

const setupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

// Check if setup is needed (no users exist)
export async function GET() {
  try {
    const userCount = await db.user.count()

    return NextResponse.json({
      needsSetup: userCount === 0,
      userCount,
    })
  } catch {
    return NextResponse.json({ needsSetup: true, userCount: 0 })
  }
}

// Create the first super_admin user (only when no users exist)
export async function POST(request: Request) {
  try {
    const userCount = await db.user.count()
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'El sistema ya está configurado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = setupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
        roleId: 'role_super_admin',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true, label: true } },
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'SYSTEM_SETUP',
        details: 'Initial super_admin account created',
      },
    })

    return NextResponse.json({
      message: 'Cuenta de super_administrador creada exitosamente',
      user,
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      )
    }
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
