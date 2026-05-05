import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const token = req.auth
  const permissions: string[] = (token as any)?.permissions || []

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  // ─── Page-level permission requirements ──────────────────
  const PAGE_PERMISSIONS: Record<string, string[]> = {
    '/dashboard/settings': ['settings.view'],
    '/dashboard/users': ['users.view'],
  }

  for (const [route, perms] of Object.entries(PAGE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      // If permissions are empty (old session), allow through — let the page handle it
      if (permissions.length === 0) break
      const hasAccess = perms.some(p => permissions.includes(p))
      if (!hasAccess) {
        return Response.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  // ─── API route permission requirements ───────────────────
  const API_PERMISSIONS: Record<string, string[]> = {
    '/api/users': ['users.view'],
    '/api/invites': ['invites.view'],
  }

  for (const [route, perms] of Object.entries(API_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      // If permissions are empty (old session), allow through — let the API handle it
      if (permissions.length === 0) break
      const hasAccess = perms.some(p => permissions.includes(p))
      if (!hasAccess) {
        return new Response(JSON.stringify({ error: 'Sin permisos' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/users/:path*',
    '/api/invites/:path*',
  ],
}
