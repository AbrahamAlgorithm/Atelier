import { cn } from '@/lib/cn'
import type { JobStatus } from '@/lib/types'

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing: { label: 'Processing', className: 'bg-blue-50 text-[#0071e3] border-blue-200' },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-600 border-red-200' },
}

export function StatusBadge({ status }: { status: JobStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-[400] border tracking-[-0.01em]', className)}>
      {status === 'processing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  )
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brown' | 'blue'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-[400] tracking-[-0.01em] border',
        variant === 'default' && 'bg-[#f2f2f4] text-[#0f1012]/60 border-[#0f1012]/10',
        variant === 'brown' && 'bg-[#e8ddd0] text-[#8B6914] border-[#C4A882]/30',
        variant === 'blue' && 'bg-blue-50 text-[#0071e3] border-blue-200',
        className
      )}
      {...props}
    />
  )
}
