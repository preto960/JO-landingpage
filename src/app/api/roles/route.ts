import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createRoleSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-z_]+$/, 'Solo minúsculas y guiones bajos'),
  label: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
})

// GET /api/roles — List all roles with their permissions
export async function GET(request: NextRequest) {
  const auth = await requireAuth({ permission: 'roles.view' })
  if (!auth.success) return auth.response

  try {
    const roles = await db.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
          orderBy: {
            permission: { module: 'asc' },
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Also get all permissions grouped by module
    const allPermissions = await db.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    })

    // Group permissions by module
    const grouped: Record<string, typeof allPermissions> = {}
    for (const p of allPermissions) {
      if (!grouped[p.module]) grouped[p.module] = []
      grouped[p.module].push(p)
    }

    return NextResponse.json({
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        label: r.label,
        description: r.description,
        userCount: r._count.users,
        permissions: r.rolePermissions.map(rp => rp.permission.name),
        createdAt: r.createdAt,
      })),
      permissions: allPermissions,
      grouped,
    })
  } catch (error) {
    console.error('List roles error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/roles — Create a new role
export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: 'roles.manage' })
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const result = createRoleSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, label, description } = result.data

    const existing = await db.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un rol con ese nombre' }, { status: 409 })
    }

    const role = await db.role.create({
      data: { name, label, description },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'ROLE_CREATED',
      details: `Rol creado: ${name} (${label})`,
    })

    return NextResponse.json({ role }, { status: 201 })
  } catch (error: any) {
    console.error('Create role error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
