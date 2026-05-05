import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PermissionName } from '@/lib/rbac'

type DbUser = {
  id: string
  roleId: string
  role: { name: string }
  isActive: boolean
}

interface AuthResult {
  success: true
  user: { id: string; name: string; email: string; role: string; roleId: string; image?: string | null }
  dbUser: DbUser
}

interface AuthError {
  success: false
  response: NextResponse
}

type AuthCheck = AuthResult | AuthError

/**
 * Verify authentication and optionally check role/permissions.
 * Returns the user data or a NextResponse error.
 */
export async function requireAuth(options?: {
  permission?: PermissionName | PermissionName[]
  requireActive?: boolean
}): Promise<AuthCheck> {
  try {
    const session = await auth()

    if (!session?.user) {
      return {
        success: false,
        response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
      }
    }

    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        roleId: true,
        isActive: true,
        role: { select: { name: true } },
      },
    })

    if (!dbUser) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 }),
      }
    }

    if (dbUser.isActive === false && options?.requireActive !== false) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 }),
      }
    }

    // Check permissions from session (JWT-stored, no DB query)
    if (options?.permission) {
      const required = Array.isArray(options.permission) ? options.permission : [options.permission]
      const hasAll = required.every(p => session.user.permissions.includes(p))
      if (!hasAll) {
        return {
          success: false,
          response: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }),
        }
      }
    }

    return {
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        roleId: session.user.roleId,
        image: session.user.image,
      },
      dbUser,
    }
  } catch (error) {
    console.error('requireAuth error:', error)
    return {
      success: false,
      response: NextResponse.json({ error: 'Error de autenticación' }, { status: 500 }),
    }
  }
}

/** Helper to get client IP from request */
export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

/** Create an audit log entry */
export async function createAuditLog(data: {
  userId?: string
  action: string
  details?: string
  ipAddress?: string
}) {
  try {
    await db.auditLog.create({ data })
  } catch {
    // Don't fail the request if audit log fails
  }
}
