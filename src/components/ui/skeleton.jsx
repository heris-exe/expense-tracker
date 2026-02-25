import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/60 dark:bg-muted/40',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

