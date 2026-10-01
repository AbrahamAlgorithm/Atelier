'use client'

import { StatusBadge } from '@/components/ui/Badge'
import type { JobStatus } from '@/lib/types'
import { cn } from '@/lib/cn'

interface JobStatusBarProps {
  status: JobStatus
  message?: string
}

const messages: Record<JobStatus, string> = {
  pending: 'Queued — waiting for processing to begin...',
  processing: 'AI is working on your image. This may take 30–90 seconds.',
  completed: 'Done! Your result is ready below.',
  failed: 'Something went wrong. Please try again.',
}

export function JobStatusBar({ status, message }: JobStatusBarProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-[10px] border text-[13px] tracking-[-0.02em]',
      status === 'pending' && 'bg-amber-50/60 border-amber-100 text-amber-800',
      status === 'processing' && 'bg-blue-50/60 border-blue-100 text-[#0071e3]',
      status === 'completed' && 'bg-green-50/60 border-green-100 text-green-800',
      status === 'failed' && 'bg-red-50/60 border-red-100 text-red-700',
    )}>
      <StatusBadge status={status} />
      <span>{message || messages[status]}</span>
    </div>
  )
}
