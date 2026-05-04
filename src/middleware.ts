import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const token = req.auth
  const userRole = token?.role as string | undefined

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  // ─── Dashboard route protection ─────────────────────────
  if (pathname.startsWith('/dashboard')) {
    // /dashboard/settings requires admin+
    if (pathname.startsWith('/dashboard/settings')) {
      if (!['admin', 'super_admin'].includes(userRole || '')) {
        return Response.redirect(new URL('/dashboard', req.url))
      }
    }

    // /dashboard/users requires super_admin
    if (pathname.startsWith('/dashboard/users')) {
      if (userRole !== 'super_admin') {
        return Response.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  // ─── API route protection ───────────────────────────────
  if (pathname.startsWith('/api/admin')) {
    if (!['admin', 'super_admin'].includes(userRole || '')) {
      return new Response(JSON.stringify({ error: 'Sin permisos' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (pathname.startsWith('/api/users')) {
    if (userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Sin permisos' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (pathname.startsWith('/api/invites')) {
    if (!['admin', 'super_admin'].includes(userRole || '')) {
      return new Response(JSON.stringify({ error: 'Sin permisos' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/users/:path*',
    '/api/invites/:path*',
  ],
}
