'use client'

import type { Session } from '@/types'

export const SESSION_COOKIE = 'pbs_session'

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function getSession(): Session | null {
  const raw = getCookieValue(SESSION_COOKIE)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    if (!session.email || !session.name || !session.expiresAt) return null
    if (new Date(session.expiresAt) < new Date()) return null
    return session
  } catch {
    return null
  }
}

export function assertSession(): Session {
  const session = getSession()
  if (!session) throw new Error('SESSION_EXPIRED')
  return session
}

export function login(
  email: string,
  password: string,
  rememberMe = false,
): { ok: true; session: Session } | { ok: false; error: string } {
  const validEmail = process.env.NEXT_PUBLIC_TEST_USER_EMAIL
  const validPassword = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD
  const userName = process.env.NEXT_PUBLIC_TEST_USER_NAME ?? 'Organizer'

  if (email !== validEmail || password !== validPassword) {
    return { ok: false, error: 'Invalid email or password' }
  }

  const maxAge = rememberMe ? 2592000 : 86400
  const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString()
  const session: Session = { email, name: userName, expiresAt }
  const encoded = encodeURIComponent(JSON.stringify(session))
  document.cookie = `${SESSION_COOKIE}=${encoded}; Path=/; SameSite=Lax; Max-Age=${maxAge}`

  return { ok: true, session }
}

export function logout(): void {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0`
}

export function safeRedirect(value: string | null | undefined): string {
  if (!value) return '/'
  if (!value.startsWith('/')) return '/'
  if (value.startsWith('//')) return '/'
  if (/[\x00-\x1f\x7f]/u.test(value)) return '/'
  if (value.includes('\\')) return '/'
  if (value === '/login' || value === '/signup') return '/' // CR-013: spec says fall back to '/'
  try {
    const url = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    if (url.origin !== (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')) return '/'
  } catch {
    return '/'
  }
  return value
}
