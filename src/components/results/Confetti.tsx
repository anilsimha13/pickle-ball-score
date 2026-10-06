'use client'

import confetti from 'canvas-confetti'
import { useEffect } from 'react'

export function Confetti() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      // Canvas/SVG fill — CSS vars not supported here
      colors: ['#D7F04A', '#1E5AA8', '#F28C28', '#FFFFFF'],
    })
  }, [])

  return null
}
