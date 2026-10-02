import Link from 'next/link'
import { Ghost, Scissors, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const tiles = [
  { icon: UserCircle2, bg: 'bg-[#f6d3ec]', className: 'left-[7%] top-[22%] rotate-[-8deg] [--float:7s]' },
  { icon: Scissors, bg: 'bg-[#cfeac6]', className: 'right-[8%] top-[16%] rotate-[7deg] [--float:8s]' },
  { icon: Ghost, bg: 'bg-[#dfe7f1]', className: 'right-[14%] bottom-[18%] rotate-[-5deg] [--float:7.5s]' },
]

export function FinalCta() {
  return (
    <section className="px-4 sm:px-6">
      <div className="reveal relative max-w-6xl mx-auto overflow-hidden rounded-[36px] bg-[#0f1012] px-6 py-24 sm:py-32 text-center">
        <div
          aria-hidden="true"
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[760px] h-[380px] rounded-t-[999px] bg-[linear-gradient(to_top,rgba(244,206,140,0.26)_0%,rgba(244,206,140,0.07)_55%,rgba(244,206,140,0)_100%)]"
        />
        <svg viewBox="0 0 1000 500" fill="none" aria-hidden="true" className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[1100px] pointer-events-none">
          <circle cx="500" cy="500" r="400" stroke="#faf9f5" strokeOpacity="0.07" />
          <circle cx="500" cy="500" r="472" stroke="#faf9f5" strokeOpacity="0.045" />
        </svg>

        {tiles.map(({ icon: Icon, bg, className }) => (
          <span
            key={bg}
            aria-hidden="true"
            className={cn('drift hidden lg:flex absolute w-14 h-14 items-center justify-center rounded-[18px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]', bg, className)}
          >
            <Icon size={22} strokeWidth={1.6} className="text-[#0f1012]" />
          </span>
        ))}

        <div className="relative">
          {/* `!` — the unlayered h1–h6 rule in globals.css otherwise wins over utilities */}
          <h2 className="mx-auto max-w-[760px] font-serif font-[400]! text-[clamp(38px,5.6vw,72px)] leading-[1.04]! text-[#faf9f5] text-balance">
            Every designer deserves an atelier.
          </h2>
          <p className="mx-auto mt-5 max-w-[460px] text-[16px] sm:text-[18px] leading-[1.55] tracking-[-0.015em] text-[#faf9f5]/60 text-balance">
            Preview, pattern and publish your next collection, starting today.
          </p>
          <div className="mt-9 flex items-center justify-center gap-2 sm:gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-11 sm:h-12 px-5 sm:px-7 rounded-full bg-[#faf9f5] text-[14px] sm:text-[15px] tracking-[-0.01em] whitespace-nowrap text-[#0f1012] hover:bg-white transition-colors"
            >
              Start Designing Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-11 sm:h-12 px-5 sm:px-7 rounded-full border border-[#faf9f5]/30 text-[14px] sm:text-[15px] tracking-[-0.01em] whitespace-nowrap text-[#faf9f5] hover:bg-[#faf9f5]/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-5 text-[12.5px] tracking-[-0.01em] text-[#faf9f5]/40">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
