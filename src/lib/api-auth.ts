import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Role, PERMISSIONS, hasMinRole, hasPermission, Permission } from '@/lib/rbac'
import { Prisma } from '@prisma/client'

type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
}

interface AuthResult {
  success: true
  user: SessionUser
  dbUser: {
    id: string
    role: Role
    isActive: boolean
  }
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
  minRole?: Role
  permission?: Permission
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
      select: { id: true, role: true, isActive: true },
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

    // Check minimum role
    if (options?.minRole) {
      if (!hasMinRole(dbUser.role, options.minRole)) {
        return {
          success: false,
          response: NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 }),
        }
      }
    }

    // Check specific permission
    if (options?.permission) {
      if (!hasPermission(dbUser.role, options.permission)) {
        return {
          success: false,
          response: NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 }),
        }
      }
    }

    return {
      success: true,
      user: session.user as SessionUser,
      dbUser: {
        id: dbUser.id,
        role: dbUser.role,
        isActive: dbUser.isActive,
      },
    }
  } catch (error) {
    console.error('requireAuth error:', error)
    return {
      success: false,
      response: NextResponse.json({ error: 'Error de autenticación' }, { status: 500 }),
    }
  }
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

/**
 * Create an audit log entry
 */
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
