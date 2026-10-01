'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/cn'
import { Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface DropZoneProps {
  label?: string
  sublabel?: string
  accept?: string[]
  maxSizeMB?: number
  onFile: (file: File, previewUrl: string) => void
  preview?: string | null
  onClear?: () => void
  disabled?: boolean
  aspectClassName?: string
}

export function DropZone({
  label = 'Drop image here',
  sublabel = 'PNG, JPG or WEBP · Max 10MB',
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 10,
  onFile,
  preview,
  onClear,
  disabled,
  aspectClassName = 'aspect-[4/3] sm:aspect-[4/5]',
}: DropZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    setError(null)
    const file = accepted[0]
    if (!file) return
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB allowed.`)
      return
    }
    const url = URL.createObjectURL(file)
    onFile(file, url)
  }, [onFile, maxSizeMB])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(accept.map(t => [t, []])),
    maxFiles: 1,
    disabled,
  })

  if (preview) {
    return (
      <div className={cn('relative w-full rounded-[10px] overflow-hidden border border-[#e8ddd0] bg-[#f2f2f4]', aspectClassName)}>
        <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-[#0f1012] hover:bg-white shadow-sm transition-colors"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          'upload-zone w-full flex flex-col items-center justify-center gap-3 cursor-pointer',
          aspectClassName,
          isDragActive && 'dragging',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-10 h-10 rounded-full bg-[#e8ddd0] flex items-center justify-center">
            {isDragActive ? (
              <ImageIcon size={18} className="text-[#8B6914]" />
            ) : (
              <Upload size={18} className="text-[#8B6914]" />
            )}
          </div>
          <div>
            <p className="text-[13px] font-[400] text-[#0f1012] tracking-[-0.02em]">
              {isDragActive ? 'Drop here' : label}
            </p>
            <p className="text-[11px] text-[#8f8f8f] mt-0.5">{sublabel}</p>
          </div>
        </div>
      </div>
      {error && <p className="text-[11px] text-red-500 px-1">{error}</p>}
    </div>
  )
}
