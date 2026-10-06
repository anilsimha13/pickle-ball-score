'use client'

import { type ReactNode } from 'react'
import { ToastProvider, ToastItem, useToast } from './Toast'

function ToastList() {
  const { toasts, dismiss } = useToast()
  if (!toasts.length) return null
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastList />
    </ToastProvider>
  )
}
