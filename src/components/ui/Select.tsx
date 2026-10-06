import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  'data-testid'?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, options, placeholder, className, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-net">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          aria-describedby={error && errorId ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full rounded-lg border border-muted bg-surface px-3 py-2 text-net',
            'focus:outline-none focus:ring-2 focus:ring-court focus:border-court',
            error && 'border-danger focus:ring-danger',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="flex items-center gap-1 text-xs text-danger" role="alert">
            <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
