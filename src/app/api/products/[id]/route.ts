import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIp, createAuditLog } from '@/lib/api-auth'
import { db } from '@/lib/db'

// GET /api/products/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth({ permission: 'products.view' })
  if (!auth.success) return auth.response

  const { id } = await params
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json({ product: { ...product, price: Number(product.price) } })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/products/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth({ permission: 'products.edit' })
  if (!auth.success) return auth.response

  const { id } = await params
  try {
    const body = await request.json()
    const { name, description, price, features, isActive } = body

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(features !== undefined && { features }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { _count: { select: { orders: true } } },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'PRODUCT_UPDATED',
      details: `Producto actualizado: ${product.name}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ product: { ...product, price: Number(product.price) } })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/products/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth({ permission: 'products.delete' })
  if (!auth.success) return auth.response

  const { id } = await params
  try {
    const product = await db.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    const orderCount = await db.order.count({ where: { productId: id } })
    if (orderCount > 0) {
      return NextResponse.json({ error: 'No se puede eliminar un producto con pedidos asociados' }, { status: 400 })
    }

    await db.product.delete({ where: { id } })

    await createAuditLog({
      userId: auth.user.id,
      action: 'PRODUCT_DELETED',
      details: `Producto eliminado: ${product.name}`,
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({ message: 'Producto eliminado' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
