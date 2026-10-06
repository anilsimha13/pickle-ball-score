import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/signup', '/contact', '/sponsors']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function parseSession(raw: string | undefined): { expiresAt: string } | null {
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    const session = JSON.parse(decoded) as { expiresAt?: string }
    if (!session.expiresAt) return null
    return session as { expiresAt: string }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value
  const session = parseSession(cookieValue)
  const isValid = session !== null && new Date(session.expiresAt) > new Date()

  if (isPublicPath(pathname)) {
    if (isValid && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (!isValid) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|sample/).*)',
  ],
}
