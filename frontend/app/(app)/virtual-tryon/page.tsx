'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCircle2, Upload, Camera, Download, RotateCcw, Save } from 'lucide-react'
import { virtualTryOnSync } from '@/lib/api'
import { downloadBlob } from '@/lib/utils'
import { TryOnViewer } from '@/components/viewer/TryOnViewer'
import { SaveProjectModal } from '@/components/jobs/SaveProjectModal'

type Stage = 'idle' | 'processing' | 'done'

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...(bytes.subarray(i, i + 8192) as unknown as number[]))
  return btoa(binary)
}

// ── Compact drop zone ─────────────────────────────────────────────────────────
function UploadZone({
  label, hint, preview, onFile, onClear, fileInputRef, cameraInputRef,
}: {
  label: string
  hint: string
  preview: string | null
  onFile: (f: File, url: string) => void
  onClear: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  cameraInputRef: React.RefObject<HTMLInputElement | null>
}) {
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) onFile(f, URL.createObjectURL(f))
    e.target.value = ''
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) onFile(f, URL.createObjectURL(f))
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !preview && fileInputRef.current?.click()}
      className="relative border-2 border-dashed border-[#0f1012]/12 rounded-[16px] bg-white hover:border-[#0f1012]/22 transition-all duration-200 group overflow-hidden cursor-pointer"
      style={{ minHeight: 220 }}
    >
      {preview ? (
        <>
          <img src={preview} alt={label} className="w-full h-full object-cover"
            style={{ minHeight: 220, display: 'block' }} />
          <button
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0f1012]/60 text-white flex items-center justify-center text-[11px]"
          >
            ✕
          </button>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
          <div className="w-12 h-12 rounded-full bg-[#f2f2f4] flex items-center justify-center">
            <Upload size={20} className="text-[#8f8f8f]" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-[400] text-[#0f1012] tracking-[-0.02em]">{label}</p>
            <p className="text-[11px] text-[#8f8f8f] mt-0.5">{hint}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-[#0f1012]/12 bg-white text-[11px] text-[#0f1012] hover:bg-[#f2f2f4] transition-colors"
            >
              <Upload size={11} /> Browse files
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click() }}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-[#0f1012]/12 bg-white text-[11px] text-[#0f1012] hover:bg-[#f2f2f4] transition-colors"
            >
              <Camera size={11} /> Take photo
            </button>
          </div>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VirtualTryOnPage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [dressFile, setDressFile] = useState<File | null>(null)
  const [dressPreview, setDressPreview] = useState<string | null>(null)
  const [personFile, setPersonFile] = useState<File | null>(null)
  const [personPreview, setPersonPreview] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)

  const dressFileRef = useRef<HTMLInputElement>(null)
  const dressCamRef = useRef<HTMLInputElement>(null)
  const personFileRef = useRef<HTMLInputElement>(null)
  const personCamRef = useRef<HTMLInputElement>(null)

  const canProcess = !!dressFile && !!personFile

  const clearDress = useCallback(() => { setDressFile(null); setDressPreview(null) }, [])
  const clearPerson = useCallback(() => { setPersonFile(null); setPersonPreview(null) }, [])

  async function handleProcess() {
    if (!dressFile || !personFile) return
    setError(null); setStage('processing')
    try {
      const [dressB64, personB64] = await Promise.all([
        fileToBase64(dressFile),
        fileToBase64(personFile),
      ])
      const result = await virtualTryOnSync(
        dressB64, dressFile.type || 'image/jpeg',
        personB64, personFile.type || 'image/jpeg',
      )
      setResultUrl(result.result_url)
      setJobId(result.job_id)
      setStage('done')
    } catch {
      setError('Our servers are temporarily busy. Please try again in a moment.'); setStage('idle')
    }
  }

  function handleReset() {
    setStage('idle'); setDressFile(null); setDressPreview(null)
    setPersonFile(null); setPersonPreview(null)
    setJobId(null); setResultUrl(null); setError(null)
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1.5">
          <UserCircle2 size={14} className="text-[#0f1012]" />
          <span className="text-[11px] text-[#8f8f8f] tracking-[0.04em] uppercase">Tool</span>
        </div>
        <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">Virtual Try-On</h1>
        <p className="text-[14px] text-[#8f8f8f] mt-1.5 tracking-[-0.02em]">
          Upload a dress and your photo to see how the garment looks on you.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {stage === 'idle' && (
          <motion.div key="idle"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-[11px] text-[#8f8f8f] uppercase tracking-[0.04em] mb-2">Dress / garment</p>
                <UploadZone
                  label="Upload the dress"
                  hint="Flat-lay or model photo"
                  preview={dressPreview}
                  onFile={(f, url) => { setDressFile(f); setDressPreview(url) }}
                  onClear={clearDress}
                  fileInputRef={dressFileRef}
                  cameraInputRef={dressCamRef}
                />
              </div>
              <div>
                <p className="text-[11px] text-[#8f8f8f] uppercase tracking-[0.04em] mb-2">Your photo</p>
                <UploadZone
                  label="Upload your photo"
                  hint="Full-body front-facing"
                  preview={personPreview}
                  onFile={(f, url) => { setPersonFile(f); setPersonPreview(url) }}
                  onClear={clearPerson}
                  fileInputRef={personFileRef}
                  cameraInputRef={personCamRef}
                />
              </div>
            </div>

            {error && (
              <p className="mb-4 text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-[10px] border border-red-100">
                {error}
              </p>
            )}

            <AnimatePresence>
              {canProcess && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={handleProcess}
                  className="w-full py-3.5 rounded-[14px] bg-[#0f1012] text-[#faf9f5] text-[14px] font-[400] tracking-[-0.02em] hover:bg-[#0f1012]/85 transition-colors"
                >
                  Try It On
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {stage === 'processing' && (
          <motion.div key="processing"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center py-28 gap-7"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UserCircle2 size={72} className="text-[#0f1012]" strokeWidth={0.9} />
            </motion.div>
            <div className="text-center space-y-1.5">
              <p className="text-[17px] font-[350] tracking-[-0.03em] text-[#0f1012]">Compositing outfit…</p>
              <p className="text-[13px] text-[#8f8f8f] tracking-[-0.02em]">This may take a minute or two</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0f1012]"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {stage === 'done' && resultUrl && personPreview && (
          <motion.div key="done"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-[#8f8f8f] tracking-[-0.02em]">Drag the slider to compare</p>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadBlob(resultUrl, `tryon-${jobId ?? 'result'}.jpg`)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#0f1012]/12 bg-white text-[12px] font-[400] text-[#0f1012] hover:bg-[#f2f2f4] transition-colors"
                >
                  <Download size={13} /> Download
                </button>
                {jobId && (
                  <button
                    onClick={() => setSaveOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#0f1012]/12 bg-white text-[12px] font-[400] text-[#0f1012] hover:bg-[#f2f2f4] transition-colors"
                  >
                    <Save size={13} /> Save
                  </button>
                )}
              </div>
            </div>

            <TryOnViewer originalUrl={personPreview} resultUrl={resultUrl} />

            <button
              onClick={handleReset}
              className="mt-5 flex items-center gap-2 text-[13px] text-[#8f8f8f] hover:text-[#0f1012] transition-colors"
            >
              <RotateCcw size={13} /> Try another look
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {saveOpen && jobId && resultUrl && (
        <SaveProjectModal
          jobId={jobId}
          defaultName={`Try-On ${new Date().toLocaleDateString()}`}
          thumbnailUrl={resultUrl}
          onClose={() => setSaveOpen(false)}
        />
      )}
    </div>
  )
}
