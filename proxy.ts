import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith('/dashboard') && !session) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/admin')) {
    if (!session) return Response.redirect(new URL('/login', req.url))
    if ((session.user as any)?.role !== 'admin') {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  }

  if (pathname === '/login' && session) {
    const role = (session.user as any)?.role
    return Response.redirect(
      new URL(role === 'admin' ? '/admin' : '/dashboard', req.url)
    )
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}