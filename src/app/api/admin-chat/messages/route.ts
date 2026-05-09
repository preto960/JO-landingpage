import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = (process.env.BACKEND_API_URL || 'https://jo-backend-shop.vercel.app').replace(/\/+$/, '')
const SERVICE_TOKEN = process.env.BACKEND_SERVICE_PASSWORD || 'Joshop2024!BridgeSec#Xk9'

// GET /api/admin-chat/messages — Fetch all admin chat messages
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const res = await fetch(`${BACKEND_URL}/chats/admin/messages`, {
      headers: {
        'X-Service-Password': SERVICE_TOKEN,
        'X-Service-User-Email': session.user.email || '',
        'X-Platform': 'landingpage',
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Error del backend' }))
      return NextResponse.json(data, { status: res.status })
    }

    const data = await res.json()

    // Backend returns { data: [...messages], pagination: {...} }
    // Transform to format expected by frontend: { messages: [...formattedMessages] }
    const rawMessages = data.data || []
    const messages = rawMessages.map((msg: any) => ({
      id: String(msg.id),
      content: msg.content,
      senderId: String(msg.senderId),
      senderName: msg.sender?.name || 'Admin',
      platform: msg.platform || 'unknown',
      senderRole: msg.sender?.email ? 'admin' : '',
      createdAt: msg.createdAt,
    }))

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('[admin-chat bridge] GET error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST /api/admin-chat/messages — Send admin message
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    const res = await fetch(`${BACKEND_URL}/chats/admin/messages`, {
      method: 'POST',
      headers: {
        'X-Service-Password': SERVICE_TOKEN,
        'X-Service-User-Email': session.user.email || '',
        'X-Platform': 'landingpage',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[admin-chat bridge] POST error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
