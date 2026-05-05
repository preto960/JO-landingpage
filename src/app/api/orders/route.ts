import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/orders — List orders
export async function GET(request: NextRequest) {
  const auth = await requireAuth({ permission: 'orders.view' })
  if (!auth.success) return auth.response

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const statusFilter = searchParams.get('status') || ''

  const where: Prisma.OrderWhereInput = {}
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }
  if (statusFilter) {
    where.status = statusFilter
  }

  try {
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { product: { select: { id: true, name: true, price: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders: orders.map(o => ({
        ...o,
        product: o.product ? { ...o.product, price: Number(o.product.price) } : null,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('List orders error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/orders — Create order
export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: 'orders.create' })
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const { productId, customerName, customerEmail, customerPhone, status, notes } = body

    if (!productId || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Producto, nombre y email del cliente son requeridos' }, { status: 400 })
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const order = await db.order.create({
      data: {
        productId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        status: status || 'pendiente',
        notes: notes || null,
      },
      include: { product: { select: { id: true, name: true, price: true } } },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'ORDER_CREATED',
      details: `Pedido creado: ${customerName} - ${product.name}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({
      order: {
        ...order,
        product: order.product ? { ...order.product, price: Number(order.product.price) } : null,
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
