'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (message: string, variant?: ToastVariant) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, variant }])
      if (variant !== 'error') {
        setTimeout(() => dismiss(id), 4000)
      }
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'bg-court-green text-line',
  warning: 'bg-kitchen text-net',
  error: 'bg-danger text-line',
}

const ICONS: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

export function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = ICONS[toast.variant]
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg max-w-sm w-full',
        VARIANT_CLASSES[toast.variant],
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
