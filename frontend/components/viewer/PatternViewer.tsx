'use client'

import { useState } from 'react'
import type { PatternPiece } from '@/lib/types'
import { cn } from '@/lib/cn'
import { ZoomIn, X } from 'lucide-react'
import Image from 'next/image'

interface PatternViewerProps {
  pieces: PatternPiece[]
}

export function PatternViewer({ pieces }: PatternViewerProps) {
  const [zoomed, setZoomed] = useState<PatternPiece | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pieces.map((piece) => (
          <div
            key={piece.name}
            className="group relative border border-[#e8ddd0] rounded-[10px] bg-white overflow-hidden cursor-zoom-in hover:border-[#8B6914] transition-colors"
            onClick={() => setZoomed(piece)}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={piece.svg_url}
                alt={piece.name}
                fill
                className="object-contain p-3"
                unoptimized
              />
            </div>
            <div className="px-3 pb-3 pt-1">
              <p className="text-[12px] font-[400] tracking-[-0.02em] text-[#0f1012]">{piece.name}</p>
              {piece.notes && (
                <p className="text-[10px] text-[#8f8f8f] mt-0.5">{piece.notes}</p>
              )}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                <ZoomIn size={12} className="text-[#0f1012]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          onClick={() => setZoomed(null)}
        >
          <div
            className="bg-white rounded-[10px] p-6 max-w-lg w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 p-1.5 hover:bg-[#f2f2f4] rounded-full transition-colors"
              onClick={() => setZoomed(null)}
            >
              <X size={16} />
            </button>
            <h3 className="text-[18px] font-[350] tracking-[-0.36px] mb-1">{zoomed.name}</h3>
            {zoomed.description && (
              <p className="text-[12px] text-[#8f8f8f] mb-4 tracking-[-0.02em]">{zoomed.description}</p>
            )}
            <div className="aspect-[4/5] relative border border-[#e8ddd0] rounded-[10px] overflow-hidden">
              <Image src={zoomed.svg_url} alt={zoomed.name} fill className="object-contain p-6" unoptimized />
            </div>
            {zoomed.notes && (
              <p className="text-[11px] text-[#8f8f8f] mt-3 text-center">{zoomed.notes}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
