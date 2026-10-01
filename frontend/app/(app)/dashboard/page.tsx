'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listJobs, deleteJob, getJobDownloadUrl } from '@/lib/api'
import { formatDistanceToNow, jobTypeLabel } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { Ghost, Scissors, UserCircle2, ArrowRight, Download, Trash2, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Job, User } from '@/lib/types'

const tools = [
  {
    href: '/ghost-mannequin', icon: Ghost, title: 'Ghost Mannequin',
    description: 'Remove the person from garment photos. Professional floating-garment product shots.',
    accent: '#8B6914', bg: 'bg-[#e8ddd0]',
  },
  {
    href: '/pattern-generator', icon: Scissors, title: 'Pattern Generator',
    description: 'Upload any garment and get AI-generated sewing pattern pieces ready to cut.',
    accent: '#0071e3', bg: 'bg-blue-50',
  },
  {
    href: '/virtual-tryon', icon: UserCircle2, title: 'Virtual Try-On',
    description: 'Upload a dress and your photo to see how the outfit looks on you virtually.',
    accent: '#0f1012', bg: 'bg-[#f2f2f4]',
  },
]

function jobThumbnail(job: Job): string | null {
  if (job.output_files.result_url) return job.output_files.result_url
  if (job.output_files.pattern_pieces?.[0]?.svg_url) return job.output_files.pattern_pieces[0].svg_url
  return null
}

// ── Result modal ──────────────────────────────────────────────────────────────
function ResultModal({ job, onClose, onDeleted }: {
  job: Job
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const [phase, setPhase] = useState<'view' | 'confirm-delete'>('view')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const imgUrl = jobThumbnail(job)

  async function handleDownload() {
    setDownloading(true)
    try {
      const { download_url } = await getJobDownloadUrl(job.id)
      // Navigate to the attachment URL — browser downloads it automatically
      // (S3 responds with Content-Disposition: attachment, no CORS needed)
      const a = document.createElement('a')
      a.href = download_url
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteJob(job.id)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      onDeleted(job.id)
      onClose()
    } catch (err) {
      setDeleteError('Something went wrong. Please try again.')
      setDeleting(false)
      setPhase('view')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f1012]/60 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-white rounded-[20px] shadow-2xl overflow-hidden w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <div>
            <p className="text-[14px] font-[400] tracking-[-0.02em] text-[#0f1012]">
              {jobTypeLabel(job.type)}
            </p>
            <p className="text-[12px] text-[#8f8f8f] mt-0.5">{formatDistanceToNow(job.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2f2f4] hover:bg-[#e8e8e8] flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Main image */}
        {imgUrl && (
          <div className="mx-5 mt-4 rounded-[14px] overflow-hidden bg-[#f8f7f3]" style={{ maxHeight: '55vh' }}>
            <img src={imgUrl} alt={jobTypeLabel(job.type)} className="w-full object-contain"
              style={{ maxHeight: '55vh', display: 'block' }} />
          </div>
        )}

        {/* Extra pattern pieces */}
        {job.type === 'pattern_generator' && (job.output_files.pattern_pieces?.length ?? 0) > 1 && (
          <div className="mx-5 mt-3 grid grid-cols-3 gap-2">
            {job.output_files.pattern_pieces!.slice(1, 4).map((p) => (
              <div key={p.name} className="rounded-[10px] overflow-hidden bg-[#f8f7f3] aspect-square">
                <img src={p.svg_url} alt={p.name} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {deleteError && (
          <div className="mx-5 mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-[10px]">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-red-600">{deleteError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="p-5 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] border border-[#0f1012]/12 text-[#0f1012] text-[13px] font-[400] hover:bg-[#f2f2f4] transition-colors disabled:opacity-50"
          >
            <Download size={14} /> {downloading ? 'Preparing…' : 'Download'}
          </button>

          {phase === 'view' ? (
            <button
              onClick={() => setPhase('confirm-delete')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] border border-red-200 text-red-500 text-[13px] font-[400] hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setPhase('view'); setDeleteError(null) }}
                className="py-2.5 px-3 rounded-[12px] border border-[#0f1012]/12 text-[#0f1012] text-[13px] font-[400] hover:bg-[#f2f2f4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] bg-red-500 text-white text-[13px] font-[400] hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = getUser<User>()
  const { data: jobs } = useQuery({ queryKey: ['jobs'], queryFn: listJobs })
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const firstName = user?.name?.split(' ')[0] || 'Designer'

  const completedJobs = jobs
    ?.filter(j => j.status === 'completed' && jobThumbnail(j) && !deletedIds.has(j.id))
    ?? []

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">
          Good to see you, {firstName}.
        </h1>
        <p className="text-[14px] text-[#8f8f8f] mt-1 tracking-[-0.02em]">Choose a tool to start creating.</p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        {tools.map(({ href, icon: Icon, title, description, accent, bg }) => (
          <Link key={href} href={href}
            className="group border border-[#0f1012]/8 rounded-[14px] bg-white p-6 hover:border-[#0f1012]/18 hover:shadow-sm transition-all duration-200 flex flex-col gap-4"
          >
            <div className={`w-10 h-10 rounded-[10px] ${bg} flex items-center justify-center`}>
              <Icon size={18} style={{ color: accent }} />
            </div>
            <div className="flex-1">
              <h2 className="text-[14px] font-[400] tracking-[-0.02em] text-[#0f1012] mb-1">{title}</h2>
              <p className="text-[12px] text-[#8f8f8f] leading-relaxed tracking-[-0.01em]">{description}</p>
            </div>
            <div className="flex items-center gap-1 text-[12px] tracking-[-0.02em]" style={{ color: accent }}>
              Open tool <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent creations */}
      {completedJobs.length > 0 && (
        <div>
          <h2 className="text-[11px] font-[400] tracking-[0.06em] text-[#8f8f8f] uppercase mb-5">
            Recent creations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {completedJobs.map((job) => {
              const thumb = jobThumbnail(job)!
              return (
                <motion.button key={job.id}
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}
                  onClick={() => setSelectedJob(job)}
                  className="relative rounded-[14px] overflow-hidden bg-[#f8f7f3] border border-[#0f1012]/6 aspect-square text-left"
                >
                  <img src={thumb} alt={jobTypeLabel(job.type)} className="w-full h-full object-cover" loading="eager" />
                  <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent">
                    <p className="text-[11px] text-white font-[400] leading-tight">{jobTypeLabel(job.type)}</p>
                    <p className="text-[10px] text-white/60 mt-0.5">{formatDistanceToNow(job.created_at)}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {jobs?.length === 0 && (
        <div className="text-center py-16 text-[#8f8f8f]">
          <p className="text-[14px] tracking-[-0.02em]">No creations yet — pick a tool above to get started.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedJob && (
          <ResultModal
            key={selectedJob.id}
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onDeleted={(id) => {
              setDeletedIds(prev => new Set([...prev, id]))
              setSelectedJob(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
