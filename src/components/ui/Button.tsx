import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  'data-testid'?: string
  'aria-disabled'?: boolean | 'true' | 'false'
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-ball text-net hover:bg-ball-dark focus-visible:ring-2 focus-visible:ring-court',
  secondary: 'bg-court text-line hover:bg-court/90 focus-visible:ring-2 focus-visible:ring-ball',
  destructive: 'bg-danger text-line hover:bg-danger/90 focus-visible:ring-2 focus-visible:ring-danger',
  ghost: 'text-court hover:bg-court/10 focus-visible:ring-2 focus-visible:ring-court',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, 'aria-disabled': ariaDisabled, ...props }, ref) => {
    const isAriaDisabled = ariaDisabled === true || ariaDisabled === 'true'
    return (
      <button
        ref={ref}
        aria-disabled={isAriaDisabled || undefined}
        {...props}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none',
          variantClasses[variant],
          sizeClasses[size],
          isAriaDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      />
    )
  },
)

Button.displayName = 'Button'
