'use client'

import {
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => dialogRef.current?.focus(), 0)
    } else {
      previousFocusRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  function trapFocus(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-net/60 p-4"
      data-testid="modal-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={trapFocus}
        className={cn('bg-surface rounded-xl shadow-xl w-full max-w-md focus:outline-none', className)}
      >
        <div className="flex items-center justify-between border-b border-muted px-6 py-4">
          <h2 id="modal-title" className="font-heading text-xl text-net">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-net"
            data-testid="modal-close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
