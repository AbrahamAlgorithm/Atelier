'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, Upload, Camera, Download, RotateCcw, Save } from 'lucide-react'
import { patternGeneratorSync } from '@/lib/api'
import { downloadBlob } from '@/lib/utils'
import { SaveProjectModal } from '@/components/jobs/SaveProjectModal'

type Stage = 'idle' | 'processing' | 'done'

export default function PatternGeneratorPage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const acceptFile = useCallback((f: File) => {
    setFile(f); setPreview(URL.createObjectURL(f)); setError(null)
  }, [])

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) acceptFile(f); e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) acceptFile(f)
  }

  async function handleProcess() {
    if (!file) return
    setError(null); setStage('processing')
    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i += 8192)
        binary += String.fromCharCode(...(bytes.subarray(i, i + 8192) as unknown as number[]))
      const result = await patternGeneratorSync(btoa(binary), file.type || 'image/jpeg')
      setResultUrl(result.result_url)
      setJobId(result.job_id)
      setStage('done')
    } catch {
      setError('Our servers are temporarily busy. Please try again in a moment.'); setStage('idle')
    }
  }

  function handleReset() {
    setStage('idle'); setFile(null); setPreview(null)
    setJobId(null); setResultUrl(null); setError(null)
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1.5">
          <Scissors size={14} className="text-[#0071e3]" />
          <span className="text-[11px] text-[#8f8f8f] tracking-[0.04em] uppercase">Tool</span>
        </div>
        <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">Pattern Generator</h1>
        <p className="text-[14px] text-[#8f8f8f] mt-1.5 tracking-[-0.02em]">
          Upload a garment photo and get all the sewing pattern pieces, ready to cut.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {stage === 'idle' && (
          <motion.div key="idle"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}
          >
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !preview && fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-[#0f1012]/12 rounded-[20px] bg-white hover:border-[#0f1012]/22 transition-all duration-200 group overflow-hidden cursor-pointer"
              style={{ minHeight: 380 }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Selected garment"
                    className="w-full object-contain"
                    style={{ minHeight: 380, maxHeight: 480, display: 'block' }} />
                  <div
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                    className="absolute top-3 right-3"
                  >
                    <span className="text-white text-[12px] bg-[#0f1012]/60 px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer">
                      Change
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleProcess() }}
                      className="w-full py-3 rounded-[14px] bg-[#0f1012] text-white text-[14px] font-[400] tracking-[-0.02em] hover:bg-[#0f1012]/85 transition-colors shadow-sm"
                    >
                      Generate Pattern Pieces
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                  <motion.div
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center"
                  >
                    <Scissors size={32} className="text-[#0071e3]" strokeWidth={1.2} />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-[16px] font-[400] tracking-[-0.03em] text-[#0f1012]">
                      Drop your garment photo here
                    </p>
                    <p className="text-[13px] text-[#8f8f8f] mt-1.5 tracking-[-0.01em]">
                      Clear front-facing photo works best · PNG, JPG, WebP
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-[#0f1012]/12 bg-white text-[13px] text-[#0f1012] hover:bg-[#f2f2f4] transition-colors"
                    >
                      <Upload size={14} /> Browse files
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click() }}
                      className="md:hidden flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-[#0f1012]/12 bg-white text-[13px] text-[#0f1012] hover:bg-[#f2f2f4] transition-colors"
                    >
                      <Camera size={14} /> Take photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-3 text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-[10px] border border-red-100">
                {error}
              </p>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFilePick} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFilePick} />
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
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Scissors size={64} className="text-[#0071e3]" strokeWidth={1} />
            </motion.div>
            <div className="text-center space-y-1.5">
              <p className="text-[17px] font-[350] tracking-[-0.03em] text-[#0f1012]">Analysing the garment…</p>
              <p className="text-[13px] text-[#8f8f8f] tracking-[-0.02em]">Generating all pattern pieces</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {stage === 'done' && resultUrl && (
          <motion.div key="done"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <div className="relative rounded-[20px] overflow-hidden bg-white border border-[#e8ddd0]">
              <img
                src={resultUrl}
                alt="Pattern sheet"
                className="w-full object-contain"
                style={{ display: 'block', maxHeight: '80vh' }}
              />
              <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-end gap-2
                bg-gradient-to-b from-black/30 to-transparent">
                <button
                  onClick={() => downloadBlob(resultUrl, `pattern-${jobId ?? 'result'}.png`)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-sm text-[12px] font-[400] text-[#0f1012] hover:bg-white transition-colors shadow-sm"
                >
                  <Download size={13} /> Download
                </button>
                {jobId && (
                  <button
                    onClick={() => setSaveOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-sm text-[12px] font-[400] text-[#0f1012] hover:bg-white transition-colors shadow-sm"
                  >
                    <Save size={13} /> Save
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-[13px] text-[#8f8f8f] hover:text-[#0f1012] transition-colors"
              >
                <RotateCcw size={13} /> Try another garment
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {saveOpen && jobId && resultUrl && (
        <SaveProjectModal
          jobId={jobId}
          defaultName={`Patterns ${new Date().toLocaleDateString()}`}
          thumbnailUrl={resultUrl}
          onClose={() => setSaveOpen(false)}
        />
      )}
    </div>
  )
}
