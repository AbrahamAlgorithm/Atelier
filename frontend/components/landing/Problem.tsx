'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/cn'

// One pain per stage of the workflow below (Preview → Pattern → Publish).
const pains = [
  {
    label: 'Sampling',
    title: 'A physical sample for every idea',
    desc: 'Every sample costs fabric, money and weeks, and clients still struggle to picture the finished piece.',
    cost: 'Weeks per sample round',
    image: '/Assets/sampling.jpeg',
    dot: 'bg-[#e88cc0]',
  },
  {
    label: 'Pattern drafting',
    title: 'Days at the cutting table',
    desc: 'A full pattern set takes days to draft by hand, and every revision starts the clock again.',
    cost: '1–3 days per pattern',
    image: '/Assets/drafting.jpeg',
    dot: 'bg-[#6fbf5f]',
  },
  {
    label: 'Product photography',
    title: 'A photo studio for every piece',
    desc: 'Photographer, studio, mannequin and retouching, repeated for every product you want to sell.',
    cost: '2–4 hours per product',
    image: '/Assets/photography.jpeg',
    dot: 'bg-[#7d9cc0]',
  },
]

export function Problem() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)

  // The section is taller than the screen; its sticky panel steps through the
  // pains as the page scrolls past.
  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      const t = Math.min(Math.max(-top / scrollable, 0), 0.9999) * pains.length
      setActive(Math.floor(t))
      setProgress(t - Math.floor(t))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <section ref={ref} className="relative" style={{ height: `calc(100svh + ${pains.length} * 70svh)` }}>
      <div className="sticky top-16 sm:top-[72px] h-[calc(100svh-64px)] sm:h-[calc(100svh-72px)] flex items-center overflow-hidden">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-16 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-[500] uppercase tracking-[0.14em] text-[#0f1012]/45">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4A882]" />
              The problem
            </p>
            {/* `!` — the unlayered h1–h6 rule in globals.css otherwise wins over utilities */}
            <h2 className="mt-4 font-serif font-[400]! text-[clamp(32px,3.6vw,48px)] leading-[1.06]! text-[#0f1012]">
              <span className="block">Big houses have ateliers.</span>
              <span className="block">You have a deadline.</span>
            </h2>
            <p className="hidden sm:block mt-4 max-w-[480px] text-[16px] sm:text-[17px] leading-[1.55] tracking-[-0.015em] text-[#0f1012]/60">
              Pattern rooms, sample rooms and photo studios are how fashion houses move fast. Independent designers do it all by hand, or pay for every step.
            </p>

            <ol className="mt-5 sm:mt-8">
              {pains.map(({ title, desc }, i) => (
                <li
                  key={title}
                  className={cn('flex gap-4 py-2.5 sm:py-3.5 transition-opacity duration-500', i === active ? 'opacity-100' : 'opacity-35')}
                >
                  <span className="w-6 pt-[3px] font-serif text-[14px] text-[#0f1012]/45">0{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-[17px] sm:text-[19px] font-[500] tracking-[-0.02em] text-[#0f1012]">{title}</p>
                    <div className={cn('grid transition-[grid-template-rows] duration-500', i === active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                      <p className="overflow-hidden text-[14px] sm:text-[15px] leading-[1.6] tracking-[-0.01em] text-[#0f1012]/60">
                        <span className="block pt-1.5">{desc}</span>
                      </p>
                    </div>
                    <div className="mt-3 h-[2px] rounded-full bg-[#0f1012]/8 overflow-hidden">
                      <div
                        className="h-full origin-left bg-[#0f1012]"
                        style={{ transform: `scaleX(${i < active ? 1 : i === active ? progress : 0})` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative w-full aspect-[16/10] max-h-[30svh] lg:max-h-none lg:aspect-[4/5] lg:h-[min(600px,calc(100svh-200px))] lg:w-auto lg:justify-self-end">
            {pains.map(({ label, title, cost, image, dot }, i) => (
              <div
                key={title}
                className="absolute inset-0 overflow-hidden rounded-[28px] bg-[#e9e6e1] transition-[opacity,scale] duration-700 ease-out"
                style={{ opacity: i === active ? 1 : 0, scale: i === active ? '1' : '1.04' }}
              >
                <Image src={image} alt={title} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur-md px-3 py-1.5 text-[12px] font-[500] tracking-[-0.01em] text-[#0f1012]">
                  <span className={cn('w-2 h-2 rounded-full', dot)} />
                  {label}
                </span>
                <span className="absolute left-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-[#0f1012]/75 backdrop-blur-md px-3.5 py-2 text-[13px] tracking-[-0.01em] text-white">
                  <Clock size={13} />
                  {cost}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
