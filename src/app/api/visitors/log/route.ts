import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple rate-limit by IP (in-memory, per-cold-start)
const recentVisits = new Map<string, number>()
const RATE_LIMIT_MS = 60_000 // 1 minute between logs from same IP

function parseUserAgent(ua: string): { browser?: string; os?: string; device?: string } {
  const browser =
    ua.match(/Firefox\/[\d.]+/) ? 'Firefox' :
    ua.match(/Edg\//) ? 'Edge' :
    ua.match(/OPR\//) ? 'Opera' :
    ua.match(/Chrome\//) ? 'Chrome' :
    ua.match(/Safari\//) ? 'Safari' : 'Otro'

  const os =
    ua.match(/Windows NT/) ? 'Windows' :
    ua.match(/Mac OS X/) ? 'macOS' :
    ua.match(/Android/) ? 'Android' :
    ua.match(/iPhone|iPad/) ? 'iOS' :
    ua.match(/Linux/) ? 'Linux' : 'Otro'

  const device =
    ua.match(/Mobile|iPhone|Android.*Mobile/) ? 'Mobile' :
    ua.match(/iPad|Tablet/) ? 'Tablet' : 'Desktop'

  return { browser, os, device }
}

async function getGeoFromIp(ip: string): Promise<{ country?: string; city?: string; region?: string }> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return {}
    const data = await res.json()
    if (data.status !== 'success') return {}
    return { country: data.country, city: data.city, region: data.regionName }
  } catch {
    return {}
  }
}

// Ensure the visitor_logs table exists
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
      console.error('[VisitorLog] Failed to create table:', err)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable()

    const ip =
      request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Rate limit: skip if same IP logged within the last minute
    const lastVisit = recentVisits.get(ip)
    if (lastVisit && Date.now() - lastVisit < RATE_LIMIT_MS) {
      return NextResponse.json({ ok: true, skipped: true })
    }
    recentVisits.set(ip, Date.now())

    const body = await request.json().catch(() => ({}))
    const ua = body.userAgent || request.headers.get('user-agent') || ''
    const { browser, os, device } = parseUserAgent(ua)

    const geo = ip !== 'unknown' ? await getGeoFromIp(ip) : {}

    await db.visitorLog.create({
      data: {
        ipAddress: ip,
        country: geo.country || null,
        city: geo.city || null,
        region: geo.region || null,
        browser: browser || null,
        os: os || null,
        device: device || null,
        page: body.page || '/',
        referer: body.referer || request.headers.get('referer') || null,
        userAgent: ua || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[VisitorLog] Error:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
