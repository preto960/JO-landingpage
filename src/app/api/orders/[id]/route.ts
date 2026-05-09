import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'

// GET /api/orders/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth({ permission: 'orders.view' })
  if (!auth.success) return auth.response

  const { id } = await params
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { product: { select: { id: true, name: true, price: true } } },
    })
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    return NextResponse.json({
      order: {
        ...order,
        product: order.product ? { ...order.product, price: Number(order.product.price) } : null,
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/orders/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth({ permission: 'orders.edit' })
  if (!auth.success) return auth.response

  const { id } = await params
  try {
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, status, notes, productId } = body

    const order = await db.order.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(customerEmail !== undefined && { customerEmail }),
        ...(customerPhone !== undefined && { customerPhone }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(productId !== undefined && { productId }),
      },
      include: { product: { select: { id: true, name: true, price: true } } },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'ORDER_UPDATED',
      details: `Pedido actualizado #${id.slice(0, 8)} - estado: ${order.status}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({
      order: {
        ...order,
        product: order.product ? { ...order.product, price: Number(order.product.price) } : null,
      }
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/orders/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth({ permission: 'orders.delete' })
  if (!auth.success) return auth.response

  const { id } = await params
  try {
    const order = await db.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    await db.order.delete({ where: { id } })

    await createAuditLog({
      userId: auth.user.id,
      action: 'ORDER_DELETED',
      details: `Pedido eliminado: ${order.customerName} - ${order.id.slice(0, 8)}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ message: 'Pedido eliminado' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
