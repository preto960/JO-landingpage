import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { Prisma } from '@prisma/client'

// Ensure the visitor_logs table exists (fallback if prisma db push didn't run)
let tableEnsured = false
async function ensureTable() {
  if (tableEnsured) return
  try {
    await db.visitorLog.count()
    tableEnsured = true
  } catch {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "visitor_logs" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "ip_address" TEXT NOT NULL DEFAULT '',
          "country" TEXT,
          "city" TEXT,
          "region" TEXT,
          "browser" TEXT,
          "os" TEXT,
          "device" TEXT,
          "page" TEXT NOT NULL DEFAULT '/',
          "referer" TEXT,
          "user_agent" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS "visitor_logs_created_at_idx" ON "visitor_logs"("created_at");
        CREATE INDEX IF NOT EXISTS "visitor_logs_country_idx" ON "visitor_logs"("country");
        CREATE INDEX IF NOT EXISTS "visitor_logs_ip_address_idx" ON "visitor_logs"("ip_address");
      `)
      tableEnsured = true
    } catch (err) {
      console.error('[VisitorLogs] Failed to create table:', err)
    }
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth({ permission: 'visitor-logs.view' })
  if (!auth.success) return auth.response

  await ensureTable()

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const country = searchParams.get('country') || undefined
    const device = searchParams.get('device') || undefined
    const search = searchParams.get('search') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    const where: any = {}

    if (country) where.country = country
    if (device) where.device = device
    if (search) {
      where.OR = [
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
        { page: { contains: search, mode: 'insensitive' } },
        { referer: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const [logs, total] = await Promise.all([
      db.visitorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.visitorLog.count({ where }),
    ])

    // Get unique countries for filter
    const countries = await db.visitorLog.groupBy({
      by: ['country'],
      where: { country: { not: null } },
      orderBy: { country: 'asc' },
    })

    return NextResponse.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
      countries: countries.map(c => c.country).filter(Boolean),
    })
  } catch (error) {
    console.error('[VisitorLogs GET] Error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json({ logs: [], total: 0, pages: 0, countries: [] })
    }
    return NextResponse.json({ error: 'Error al obtener logs' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth({ permission: 'visitor-logs.delete' })
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const beforeDate = searchParams.get('beforeDate')

    if (beforeDate) {
      const count = await db.visitorLog.deleteMany({
        where: { createdAt: { lt: new Date(beforeDate) } },
      })
      return NextResponse.json({ deleted: count })
    }

    // Delete all logs if no date specified
    const count = await db.visitorLog.deleteMany()
    return NextResponse.json({ deleted: count })
  } catch (error) {
    console.error('[VisitorLogs DELETE] Error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json({ deleted: 0 })
    }
    return NextResponse.json({ error: 'Error al eliminar logs' }, { status: 500 })
  }
}
