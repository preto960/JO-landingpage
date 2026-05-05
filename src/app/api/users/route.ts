import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db, hashPassword } from '@/lib/db'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string().optional(),
})

// POST /api/users — Create a new user (admin action)
export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: 'users.create' })
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const result = createUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, password, roleId } = result.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }

    const hashed = await hashPassword(password)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        emailVerified: new Date(),
        roleId: roleId || 'role_viewer',
      },
      select: {
        id: true, name: true, email: true, isActive: true, createdAt: true,
        role: { select: { name: true, label: true } },
      },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'USER_CREATED',
      details: `Usuario creado: ${email} con rol ${roleId || 'viewer'}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET /api/users — List users
export async function GET(request: NextRequest) {
  const auth = await requireAuth({ permission: 'users.view' })
  if (!auth.success) return auth.response

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const roleFilter = searchParams.get('role') || ''

  const where: Prisma.UserWhereInput = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (roleFilter) {
    where.role = { name: roleFilter }
  }

  try {
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { name: true, label: true } },
          image: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          _count: { select: { auditLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
