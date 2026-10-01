'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listJobs } from '@/lib/api'
import type { Job } from '@/lib/types'

function thumbnail(job: Job): string | null {
  return job.output_files.result_url
    ?? job.output_files.pattern_pieces?.[0]?.svg_url
    ?? null
}

export function DashboardPrefetcher() {
  const { data: jobs } = useQuery({ queryKey: ['jobs'], queryFn: listJobs })

  useEffect(() => {
    if (!jobs) return
    jobs.forEach(job => {
      const url = thumbnail(job)
      if (url) new Image().src = url
    })
  }, [jobs])

  return null
}
