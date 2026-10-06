'use client'
import { useState, useEffect } from 'react'

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    // This is the canonical pattern for detecting client-side hydration completion.
    // The setState call is intentionally inside the effect with no external deps.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [])
  return hydrated
}
