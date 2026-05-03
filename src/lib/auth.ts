import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db, verifyPassword } from '@/lib/db'

// Build NEXTAUTH_URL dynamically to work behind reverse proxies (Caddy)
const getNextAuthUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  // In production, trust the VERCEL_URL or fallback to constructing from headers
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return undefined // Let next-auth use the request Host header
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            return null
          }

          if (!user.isActive) {
            return null
          }

          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            return null
          }

          await db.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          }).catch(() => {})

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth authorize error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
  },
  // Set NEXTAUTH_URL dynamically — critical for cookie domain behind reverse proxies
  ...(getNextAuthUrl() ? { url: getNextAuthUrl() } : {}),
  // Do NOT set pages.signIn — we handle redirects ourselves in the dashboard layout
  // Setting it causes redirect loops when the session check fails
  secret: process.env.NEXTAUTH_SECRET,
}
