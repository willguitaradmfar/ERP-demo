import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')
  const isPublicRoute = req.nextUrl.pathname === '/'

  // Allow API routes
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from login page
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  // Protect admin routes
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Redirect root to admin if logged in, to login if not
  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
