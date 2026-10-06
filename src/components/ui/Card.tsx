import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  kitchenStrip?: boolean
  'data-testid'?: string
}

export function Card({ kitchenStrip, className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'bg-surface rounded-xl shadow-sm',
        kitchenStrip && 'border-t-4 border-t-kitchen',
        className,
      )}
    >
      {children}
    </div>
  )
}
