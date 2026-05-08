import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = (process.env.BACKEND_API_URL || 'https://jo-backend-shop.vercel.app').replace(/\/+$/, '')
const SERVICE_TOKEN = process.env.BACKEND_SERVICE_PASSWORD || 'Joshop2024!BridgeSec#Xk9'

// POST /api/admin-chat/pusher-auth — Forward Pusher channel auth to backend
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Read the raw body (pusher-js sends application/x-www-form-urlencoded)
    const body = await req.text()

    const res = await fetch(`${BACKEND_URL}/pusher/auth`, {
      method: 'POST',
      headers: {
        'X-Service-Password': SERVICE_TOKEN,
        'X-Service-User-Email': session.user.email || '',
        'X-Platform': 'landingpage',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[pusher-auth bridge] error:', err)
    return NextResponse.json({ error: 'Auth fallida' }, { status: 500 })
  }
}
