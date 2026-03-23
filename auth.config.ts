import type { NextAuthConfig } from 'next-auth'

// NO mongoose/bcrypt here — safe for Edge Runtime
export const authConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.name = user.name
      }
      // Permite update() din client să schimbe name
      if (trigger === 'update' && session?.name !== undefined) {
        token.name = session.name
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.name = token.name
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
} satisfies NextAuthConfig