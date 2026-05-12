import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { Prisma } from '@prisma/client'

// Ensure site_configs table exists (fallback)
let tableEnsured = false
async function ensureTable() {
  if (tableEnsured) return
  try {
    await db.siteConfig.count()
    tableEnsured = true
  } catch {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "site_configs" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL DEFAULT '',
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "site_configs_key_key" ON "site_configs"("key");
      `)
      tableEnsured = true
    } catch (err) {
      console.error('[SiteConfig] Failed to create table:', err)
    }
  }
}

// Default configuration values
const DEFAULTS: Record<string, string> = {
  template: 'v1-luxury',
  site_name: 'JO System',
  site_description: 'Tiendas online, apps y dashboards para tu negocio',
  primary_color: '#C9A84C',
  whatsapp_number: '',
}

/**
 * GET /api/site-config — Public endpoint (landing page needs to read config)
 * Optional ?key=xxx to get a single config value
 */
export async function GET(request: NextRequest) {
  await ensureTable()

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      const config = await db.siteConfig.findUnique({ where: { key } })
      return NextResponse.json({ key, value: config?.value ?? DEFAULTS[key] ?? null })
    }

    // Return all config
    const configs = await db.siteConfig.findMany()
    const configMap: Record<string, string> = { ...DEFAULTS }
    for (const c of configs) {
      configMap[c.key] = c.value
    }
    return NextResponse.json(configMap)
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(DEFAULTS)
    }
    console.error('[SiteConfig GET] Error:', error)
    return NextResponse.json(DEFAULTS)
  }
}

/**
 * PUT /api/site-config — Protected endpoint (admin only)
 * Body: { key: string, value: string } or { configs: Record<string, string> }
 */
export async function PUT(request: NextRequest) {
  const auth = await requireAuth({ permission: 'appearance.edit' })
  if (!auth.success) return auth.response

  await ensureTable()

  try {
    const body = await request.json()

    // Batch update
    if (body.configs && typeof body.configs === 'object') {
      const results: Record<string, string> = {}
      for (const [key, value] of Object.entries(body.configs)) {
        const config = await db.siteConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
        results[config.key] = config.value
      }
      return NextResponse.json({ success: true, configs: results })
    }

    // Single update
    if (!body.key || body.value === undefined) {
      return NextResponse.json({ error: 'Se requiere key y value' }, { status: 400 })
    }

    const config = await db.siteConfig.upsert({
      where: { key: body.key },
      update: { value: String(body.value) },
      create: { key: body.key, value: String(body.value) },
    })

    return NextResponse.json({ success: true, key: config.key, value: config.value })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json({ error: 'Tabla no disponible, reintente en unos segundos' }, { status: 503 })
    }
    console.error('[SiteConfig PUT] Error:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
