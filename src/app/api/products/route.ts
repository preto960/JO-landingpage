import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/products — List products
export async function GET(request: NextRequest) {
  const auth = await requireAuth({ permission: 'products.view' })
  if (!auth.success) return auth.response

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  const where: Prisma.ProductWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  try {
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products: products.map(p => ({
        ...p,
        price: Number(p.price),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('List products error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/products — Create product
export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: 'products.create' })
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const { name, description, price, features } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || null,
        price,
        features: features || [],
      },
      include: { _count: { select: { orders: true } } },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'PRODUCT_CREATED',
      details: `Producto creado: ${name}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ product: { ...product, price: Number(product.price) } }, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
