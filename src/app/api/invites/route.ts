import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

const createInviteSchema = z.object({
  role: z.enum(['viewer', 'editor', 'admin']),
  maxUses: z.number().int().min(1).max(100).optional(),
  expiresInHours: z.number().int().min(1).max(720).optional(),
})

// Generate a readable invite code
function generateInviteCode(): string {
  const bytes = crypto.randomBytes(4)
  return bytes.toString('hex').toUpperCase().slice(0, 8)
}

export async function GET() {
  const auth = await requireAuth({ minRole: 'admin' })
  if (!auth.success) return auth.response

  try {
    const invites = await db.inviteCode.findMany({
      where: { createdBy: auth.dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { name: true, email: true },
        },
        usedBy: {
          select: { name: true, email: true },
        },
      },
    })

    // Only super_admin can see all invites
    if (auth.dbUser.role === 'super_admin') {
      const allInvites = await db.inviteCode.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { name: true, email: true },
          },
          usedBy: {
            select: { name: true, email: true },
          },
        },
      })
      return NextResponse.json({ invites: allInvites })
    }

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('List invites error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth({ minRole: 'admin' })
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const result = createInviteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors }, { status: 400 })
    }

    // Admin can only invite viewer/editor, not admin roles
    if (auth.dbUser.role !== 'super_admin' && result.data.role === 'admin') {
      return NextResponse.json({ error: 'Solo un super_admin puede invitar administradores' }, { status: 403 })
    }

    const code = generateInviteCode()
    const expiresAt = result.data.expiresInHours
      ? new Date(Date.now() + result.data.expiresInHours * 60 * 60 * 1000)
      : null

    const invite = await db.inviteCode.create({
      data: {
        code,
        role: result.data.role,
        maxUses: result.data.maxUses ?? 1,
        expiresAt,
        createdBy: auth.dbUser.id,
      },
      include: {
        creator: {
          select: { name: true, email: true },
        },
      },
    })

    await createAuditLog({
      userId: auth.dbUser.id,
      action: 'INVITE_CREATED',
      details: `Created invite code ${code} for role ${result.data.role}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ invite }, { status: 201 })
  } catch (error) {
    console.error('Create invite error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth({ minRole: 'super_admin' })
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.inviteCode.delete({ where: { id } })

    await createAuditLog({
      userId: auth.dbUser.id,
      action: 'INVITE_DELETED',
      details: `Deleted invite code ${id}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ message: 'Invitación eliminada' })
  } catch (error) {
    console.error('Delete invite error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
