import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'safe' | 'caution' | 'danger' | 'neutral'
  label: string
  className?: string
}

const statusStyles = {
  safe: 'bg-status-safe/15 text-status-safe border-status-safe/25',
  caution: 'bg-status-caution/15 text-status-caution border-status-caution/25',
  danger: 'bg-status-danger/15 text-status-danger border-status-danger/25',
  neutral: 'bg-status-neutral/15 text-status-neutral border-status-neutral/25',
}

const dotStyles = {
  safe: 'bg-status-safe',
  caution: 'bg-status-caution',
  danger: 'bg-status-danger',
  neutral: 'bg-status-neutral',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[status])} />
      {label}
    </span>
  )
}
