import { NextRequest, NextResponse } from 'next/server'
import { db, hashPassword } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  roleId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, password, roleId } = result.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })

    const hashedPassword = await hashPassword(password)

    // Default role: viewer if not specified
    const userRoleId = roleId || 'role_viewer'

    const user = await db.user.create({
      data: {
        name, email, password: hashedPassword,
        emailVerified: new Date(),
        roleId: userRoleId,
      },
      select: { id: true, name: true, email: true, createdAt: true, role: { select: { name: true, label: true } } },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: `Nuevo usuario registrado: ${email} con rol ${userRoleId}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    })

    return NextResponse.json({ message: 'Cuenta creada exitosamente', user }, { status: 201 })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
