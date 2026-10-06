import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="motion-safe:animate-bounce motion-reduce:animate-pulse"
      >
        {/* Canvas/SVG fill — CSS vars not supported here */}
        <circle cx="16" cy="16" r="14" fill="#D7F04A" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const cx = 16 + 8 * Math.cos(rad)
          const cy = 16 + 8 * Math.sin(rad)
          return <circle key={i} cx={cx} cy={cy} r="2" fill="#1F2937" opacity="0.4" />
        })}
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
