'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const painCards = [
  {
    badge: 'EXPENSIVE',
    badgeColor: 'bg-[#e8ddd0] text-[#8B6914]',
    image: '/Assets/photography.jpeg',
    title: 'Ghost mannequin photography',
    desc: 'Hiring a photographer and renting a studio for product shots costs thousands per collection — then hours of Photoshop retouching on top.',
    fix: 'Ghost Mannequin tool',
    fixHref: '/register',
  },
  {
    badge: 'TIME-CONSUMING',
    badgeColor: 'bg-[#f2f2f4] text-[#0f1012]',
    image: '/Assets/drafting.jpeg',
    title: 'Pattern drafting from scratch',
    desc: 'A full pattern set for one design takes days to draft manually. Any change means starting over. There is no fast path.',
    fix: 'Pattern Generator tool',
    fixHref: '/register',
  },
  {
    badge: 'COSTLY',
    badgeColor: 'bg-[#f2f2f4] text-[#0f1012]',
    image: '/Assets/sampling.jpeg',
    title: 'Physical sampling rounds',
    desc: 'Samples cost hundreds to thousands each. Clients reject most of them because they cannot visualize the final garment from a sketch.',
    fix: 'Virtual Try-On tool',
    fixHref: '/register',
  },
  {
    badge: 'SLOW',
    badgeColor: 'bg-red-50 text-red-500',
    image: '/Assets/iteration.jpeg',
    title: 'Weeks-long iteration cycles',
    desc: 'One revision requires redrafting, resampling, and rescheduling. By the time feedback loops close, the season has moved on.',
    fix: 'All three tools together',
    fixHref: '/register',
  },
]

export function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrolledIn = -rect.top

      if (scrolledIn <= 0) {
        setActiveIndex(0)
        setStepProgress(0)
        return
      }

      const totalScrollable = rect.height - window.innerHeight
      if (scrolledIn >= totalScrollable) {
        setActiveIndex(painCards.length - 1)
        setStepProgress(1)
        return
      }

      const perStep = totalScrollable / painCards.length
      const idx = Math.min(Math.floor(scrolledIn / perStep), painCards.length - 1)
      const progress = (scrolledIn - idx * perStep) / perStep
      setActiveIndex(idx)
      setStepProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    // Container is taller than the viewport — the sticky child locks while this scrolls past
    <div
      ref={containerRef}
      style={{ height: `calc(${painCards.length + 1} * 100vh)` }}
    >
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden bg-[#faf9f5]">
        <div className="flex-1 flex items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">

            {/* Section label */}
            <div className="flex items-center gap-2 mb-10 lg:mb-14">
              <div className="w-4 h-4 rounded-[4px] bg-[#e8ddd0] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B6914]" />
              </div>
              <span className="text-[12px] font-[400] tracking-[-0.01em] text-[#8f8f8f]">The problem</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-24 items-center">

              {/* Left — step indicators + animated text */}
              <div className="flex gap-7 lg:gap-10">

                {/* Vertical step bars */}
                <div className="flex flex-col gap-3 shrink-0 pt-0.5">
                  {painCards.map((_, i) => {
                    const fill = i < activeIndex ? 1 : i === activeIndex ? stepProgress : 0
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-[3px] h-12 lg:h-14 rounded-full bg-[#0f1012]/10 overflow-hidden flex flex-col">
                          <div
                            className="w-full rounded-full bg-[#0f1012]"
                            style={{ height: `${fill * 100}%`, transition: fill === 0 ? 'none' : 'height 0.1s linear' }}
                          />
                        </div>
                        <span
                          className="text-[9px] font-[400] tracking-[0.04em] transition-colors duration-300"
                          style={{ color: i <= activeIndex ? '#0f1012' : '#0f1012' + '33' }}
                        >
                          0{i + 1}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Stacked text panels — only active one is visible */}
                <div className="relative flex-1 h-72 lg:h-80 overflow-hidden">
                  {painCards.map(({ badge, badgeColor, title, desc, fix, fixHref }, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 flex flex-col gap-4 lg:gap-5"
                      style={{
                        opacity: i === activeIndex ? 1 : 0,
                        transform:
                          i === activeIndex
                            ? 'translateY(0px)'
                            : i < activeIndex
                            ? 'translateY(-20px)'
                            : 'translateY(28px)',
                        transition: 'opacity 0.55s ease, transform 0.55s ease',
                        pointerEvents: i === activeIndex ? 'auto' : 'none',
                      }}
                    >
                      <span className={`w-fit text-[9px] font-[500] tracking-[0.08em] px-2.5 py-1 rounded-full ${badgeColor}`}>
                        {badge}
                      </span>
                      <h3 className="text-[clamp(22px,2.8vw,38px)] font-[350] tracking-[-0.04em] leading-[1.1] text-[#0f1012]">
                        {title}
                      </h3>
                      <p className="text-[15px] lg:text-[16px] text-[#8f8f8f] tracking-[-0.02em] leading-relaxed">
                        {desc}
                      </p>
                      <Link
                        href={fixHref}
                        className="inline-flex items-center gap-2 text-[13px] font-[400] tracking-[-0.02em] text-[#8B6914] hover:gap-3 transition-all duration-200 w-fit mt-1"
                      >
                        {fix} <ArrowRight size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — crossfading image card */}
              <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden border border-[#0f1012]/8 bg-[#f2f2f4]">
                {painCards.map(({ image, title }, i) => (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      opacity: i === activeIndex ? 1 : 0,
                      transition: 'opacity 0.6s ease',
                    }}
                  >
                    <Image
                      src={image}
                      alt={title}
                      fill
                      priority={i === 0}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
