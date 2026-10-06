'use client'

import { type ReactNode } from 'react'
import { useHydrated } from '@/hooks/useHydrated'
import { Spinner } from './Spinner'

interface HydrationGateProps {
  children: ReactNode
  fallback?: ReactNode
}

export function HydrationGate({ children, fallback }: HydrationGateProps) {
  const hydrated = useHydrated()
  if (!hydrated) return <>{fallback ?? <Spinner className="py-16" />}</>
  return <>{children}</>
}
