import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-lg bg-bg motion-safe:animate-pulse', className)}
      aria-hidden="true"
    />
  )
}
