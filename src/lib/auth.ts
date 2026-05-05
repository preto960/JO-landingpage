import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db, verifyPassword } from '@/lib/db'
import { getUserPermissions } from '@/lib/rbac'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          })

          if (!user) return null
          if (!user.isActive) return null

          const isValidPassword = await verifyPassword(credentials.password as string, user.password)
          if (!isValidPassword) return null

          await db.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          }).catch(() => {})

          const permissions = user.role.rolePermissions.map(rp => rp.permission.name)

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            roleId: user.roleId,
            permissions,
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
        token.id = user.id!
        token.role = (user as any).role
        token.roleId = (user as any).roleId
        token.permissions = (user as any).permissions || []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.roleId = token.roleId as string
        session.user.permissions = token.permissions as string[]
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
})
