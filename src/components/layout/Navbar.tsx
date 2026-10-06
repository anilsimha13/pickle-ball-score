'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobileMenu } from './MobileMenu'
import { useAuthStore } from '@/store/useAuthStore'
import { logout } from '@/lib/auth'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/players', label: 'Players' },
  { href: '/teams', label: 'Teams' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/settings', label: 'Settings' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { session, setSession, init } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    init()
  }, [init])

  function handleLogout() {
    logout()
    setSession(null)
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header className="bg-court text-line sticky top-0 z-40 shadow-md" data-testid="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href={session ? '/dashboard' : '/login'}
              className="font-heading text-2xl text-ball hover:text-ball-dark transition-colors"
              data-testid="navbar-logo"
            >
              Pickle Ball Score
            </Link>

            {/* Desktop nav */}
            {session ? (
              <nav className="hidden md:flex items-center gap-1" data-testid="navbar-desktop">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'px-3 py-1.5 rounded text-sm text-line hover:text-ball transition-colors',
                      isActive(href) && 'border-b-2 border-ball text-ball',
                    )}
                    data-testid={`nav-${label.toLowerCase()}`}
                  >
                    {label}
                  </Link>
                ))}
                <span className="ml-4 text-sm text-line/70">{session.name}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-sm text-line hover:text-ball"
                  data-testid="nav-logout"
                >
                  Logout
                </button>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center gap-2" data-testid="navbar-desktop">
                <Link href="/login" className="text-sm text-line hover:text-ball" data-testid="nav-login">Login</Link>
                <Link
                  href="/signup"
                  className="rounded bg-ball px-3 py-1.5 text-sm font-medium text-net hover:bg-ball-dark"
                  data-testid="nav-signup"
                >
                  Sign Up
                </Link>
              </nav>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-line"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              data-testid="navbar-hamburger"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isLoggedIn={!!session}
        onLogout={handleLogout}
      />
    </>
  )
}
