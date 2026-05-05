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
  inviteCode: z.string().min(4, 'Código de invitación requerido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, password, inviteCode } = result.data

    // Validate invite code
    const invite = await db.inviteCode.findUnique({ where: { code: inviteCode } })
    if (!invite) return NextResponse.json({ error: 'Código de invitación inválido' }, { status: 400 })
    if (invite.expiresAt && invite.expiresAt < new Date()) return NextResponse.json({ error: 'El código de invitación ha expirado' }, { status: 400 })
    if (invite.usedCount >= invite.maxUses) return NextResponse.json({ error: 'El código de invitación ya fue usado el máximo de veces' }, { status: 400 })

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name, email, password: hashedPassword,
        emailVerified: new Date(),
        roleId: invite.roleId,
        inviteCodeId: invite.id,
      },
      select: { id: true, name: true, email: true, createdAt: true, role: { select: { name: true, label: true } } },
    })

    await db.inviteCode.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: `New user registered: ${email} with role ${invite.roleId}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    })

    return NextResponse.json({ message: 'Cuenta creada exitosamente', user }, { status: 201 })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
