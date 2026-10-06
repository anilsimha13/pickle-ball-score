'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/players', label: 'Players' },
  { href: '/teams', label: 'Teams' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/settings', label: 'Settings' },
]

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  isLoggedIn: boolean
  onLogout: () => void
}

export function MobileMenu({ open, onClose, isLoggedIn, onLogout }: MobileMenuProps) {
  const pathname = usePathname()

  if (!open) return null

  return (
    <div className="md:hidden bg-court border-t border-court/30" data-testid="mobile-menu">
      <nav className="flex flex-col py-2">
        {isLoggedIn ? (
          <>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'px-4 py-3 text-line hover:bg-court/80',
                  pathname === href && 'border-l-4 border-ball',
                )}
                data-testid={`mobile-nav-${label.toLowerCase()}`}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={() => { onLogout(); onClose() }}
              className="px-4 py-3 text-left text-line hover:bg-court/80"
              data-testid="mobile-nav-logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" onClick={onClose} className="px-4 py-3 text-line hover:bg-court/80" data-testid="mobile-nav-login">
              Login
            </Link>
            <Link href="/signup" onClick={onClose} className="px-4 py-3 text-line hover:bg-court/80" data-testid="mobile-nav-signup">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
