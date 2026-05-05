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
    '/dashboard/users': ['users.view'],
    '/dashboard/roles': ['roles.view'],
    '/dashboard/products': ['products.view'],
    '/dashboard/orders': ['orders.view'],
    '/dashboard/profile': ['settings.view'],
  }

  for (const [route, perms] of Object.entries(PAGE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (permissions.length === 0) break
      const hasAccess = perms.some(p => permissions.includes(p))
      if (!hasAccess) {
        return Response.redirect(new URL('/dashboard', req.url))
      }
    }
  }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/users/:path*',
    '/api/roles/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
  ],
}
