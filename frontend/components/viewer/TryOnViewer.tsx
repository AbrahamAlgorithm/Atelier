'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface TryOnViewerProps {
  originalUrl: string
  resultUrl: string
}

export function TryOnViewer({ originalUrl, resultUrl }: TryOnViewerProps) {
  const [sliderX, setSliderX] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setSliderX(pct)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-[10px] overflow-hidden cursor-ew-resize select-none border border-[#e8ddd0]"
      onMouseDown={(e) => { dragging.current = true; updateSlider(e.clientX) }}
      onMouseMove={(e) => { if (dragging.current) updateSlider(e.clientX) }}
      onMouseUp={() => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onTouchStart={(e) => { dragging.current = true; updateSlider(e.touches[0].clientX) }}
      onTouchMove={(e) => { if (dragging.current) updateSlider(e.touches[0].clientX) }}
      onTouchEnd={() => { dragging.current = false }}
    >
      {/* Result (right side = try-on) */}
      <div className="absolute inset-0">
        <Image src={resultUrl} alt="Try-on result" fill className="object-cover" unoptimized />
      </div>

      {/* Original (left side) clipped by slider */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderX}%` }}>
        <div className="absolute inset-0" style={{ width: `${10000 / sliderX}%` }}>
          <Image src={originalUrl} alt="Original" fill className="object-cover" unoptimized />
        </div>
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
        style={{ left: `${sliderX}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 8L2 5m0 0L5 2M2 5h12M11 8l3 3m0 0l-3 3m3-3H2" stroke="#0f1012" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-[400] tracking-[-0.02em] text-[#0f1012]">
        Before
      </div>
      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-[400] tracking-[-0.02em] text-[#0f1012]">
        Try-on
      </div>
    </div>
  )
}
