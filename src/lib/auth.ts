import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db, verifyPassword } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  // Trust the Host header from the request instead of relying on NEXTAUTH_URL
  // This is critical for Vercel / container deployments where the URL is dynamic
  trustHost: true,

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

          // Update last login
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
    maxAge: 24 * 60 * 60, // 24 hours
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
  pages: {
    signIn: '/login',
  },
  // Fallback to process.env.NEXTAUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET,
}
