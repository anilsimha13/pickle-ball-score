'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from '@/components/ui/Toast'

const PUBLIC_PATHS = ['/login', '/signup', '/contact', '/sponsors']

export function useSession() {
  const router = useRouter()
  const pathname = usePathname()
  const { session, setSession } = useAuthStore()
  const { toast } = useToast()

  const isProtected = !PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  useEffect(() => {
    if (!isProtected) return

    function checkExpiry() {
      const s = getSession()
      if (!s) {
        setSession(null)
        toast('Your session has expired. Please log in again.', 'error')
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
    }

    window.addEventListener('focus', checkExpiry)
    return () => window.removeEventListener('focus', checkExpiry)
  }, [isProtected, pathname, router, setSession, toast])

  return session
}
