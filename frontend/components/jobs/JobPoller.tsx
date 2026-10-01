'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getJob } from '@/lib/api'
import type { Job } from '@/lib/types'

interface JobPollerProps {
  jobId: string
  onComplete: (job: Job) => void
  onFail?: (job: Job) => void
}

export function JobPoller({ jobId, onComplete, onFail }: JobPollerProps) {
  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'completed' || status === 'failed') return false
      return 3000
    },
    staleTime: 0,
  })

  useEffect(() => {
    if (!job) return
    if (job.status === 'completed') onComplete(job)
    else if (job.status === 'failed') onFail?.(job)
  }, [job?.status])

  return null
}
