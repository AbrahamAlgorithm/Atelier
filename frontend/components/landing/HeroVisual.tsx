import Image from 'next/image'
import { Check, Download, Ghost, Heart, MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/cn'
import { AtelierMark } from './AtelierMark'
import { PatternPieces } from './PatternPieces'

// The composition is drawn at desktop size (1180 × 420); `.hero-stage` in
// globals.css scales it to the screen's width and height.
// Below md the cards keep their desktop internals but are zoomed and repositioned
// around a smaller phone, clear of its header and the model's face, and the
// two outermost cards are dropped.

function Float({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={cn('hero-card absolute', className)}>{children}</div>
}

const cardZoom = '[zoom:0.66] md:[zoom:1]'

export function HeroVisual() {
  return (
    <div className="flex justify-center">
      <div
        role="img"
        aria-label="Atelier app preview: a virtual try-on result on a phone, surrounded by a ghost mannequin product shot, generated sewing pattern pieces, a time-saved stat and a client approval."
        className="hero-stage relative w-full h-[358px] md:w-[1180px] md:h-[420px] shrink-0 [clip-path:inset(-50%_-50%_0_-50%)]"
      >
        <div aria-hidden="true">
          {/* ── Backdrop: warm half-disc + hairline arcs ── */}
          <div className="hero-fade absolute bottom-0 left-1/2 -translate-x-1/2 w-[420px] h-[210px] md:w-[680px] md:h-[340px] rounded-t-[999px] bg-[linear-gradient(to_top,#f7e0b0_0%,#f9ebd1_45%,#fbf4e7_100%)]" />
          <svg
            viewBox="0 0 1000 500"
            className="hero-fade absolute bottom-0 left-1/2 -translate-x-1/2 w-[640px] h-[320px] md:w-[1000px] md:h-[500px]"
            fill="none"
          >
            <circle cx="500" cy="500" r="380" stroke="#0f1012" strokeOpacity="0.08" vectorEffect="non-scaling-stroke" />
            <circle cx="500" cy="500" r="420" stroke="#0f1012" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* ── Phone: Virtual Try-On result ── */}
          <div className="hero-phone absolute z-10 left-[calc(50%-114px)] top-[12px] md:left-[calc(50%-150px)] md:top-[16px]">
            <div className="[zoom:0.76] md:[zoom:1] relative w-[300px] h-[620px] rounded-[52px] bg-[#0f1012] p-[10px] shadow-[0_40px_80px_-30px_rgba(15,16,18,0.45)]">
              <span className="absolute -left-[3px] top-[118px] h-[30px] w-[3px] rounded-l-[2px] bg-[#0f1012]" />
              <span className="absolute -left-[3px] top-[164px] h-[54px] w-[3px] rounded-l-[2px] bg-[#0f1012]" />
              <span className="absolute -right-[3px] top-[150px] h-[78px] w-[3px] rounded-r-[2px] bg-[#0f1012]" />

              <div className="relative h-full w-full overflow-hidden rounded-[42px] bg-[#e7e5e1]">
                <Image
                  src="/hero/tryon-model.webp"
                  alt=""
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="280px"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
                <div className="hero-scan absolute inset-0">
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white/30" />
                  <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-white shadow-[0_0_14px_3px_rgba(255,255,255,0.75)]" />
                </div>

                <div className="absolute left-1/2 top-[10px] -translate-x-1/2 h-[26px] w-[88px] rounded-full bg-[#0f1012]" />

                <div className="absolute inset-x-4 top-[48px] flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AtelierMark className="w-7 h-7 rounded-full ring-2 ring-white/80" />
                    <div>
                      <p className="text-[12.5px] font-[500] tracking-[-0.01em] text-white">Virtual Try-On</p>
                      <div className="mt-1 h-[3px] w-[74px] rounded-full bg-white/35">
                        <div className="h-full w-[72%] rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-[#ef4444] px-2 py-[3px] text-[10.5px] font-[500] text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" />
                    Live
                  </span>
                </div>

                <div className="absolute left-3.5 top-[318px] hidden md:flex items-center gap-2 rounded-full bg-white/85 backdrop-blur-md py-1 pl-1 pr-3 shadow-[0_6px_16px_-6px_rgba(15,16,18,0.3)]">
                  <span className="w-6 h-6 rounded-full bg-[#e05a75] ring-2 ring-white" />
                  <span className="text-[11.5px] font-[500] tracking-[-0.01em] text-[#0f1012]">Raspberry blazer</span>
                  <Check size={12} strokeWidth={2.5} className="text-[#16a34a]" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Ghost Mannequin product shot ── */}
          <Float className="z-20 left-[calc(50%-172px)] top-[96px] md:left-[calc(50%-425px)] md:top-[6px] [--d:520ms] [--float:7.5s]">
            <div className={cardZoom}>
              <div className="relative w-[172px] h-[215px] overflow-hidden rounded-[18px] bg-[#efe6d4] ring-1 ring-[#0f1012]/5 shadow-[0_18px_40px_-24px_rgba(15,16,18,0.35)]">
                <Image src="/hero/ghost-garment.webp" alt="" fill sizes="172px" className="object-cover" />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-[3px] text-[11.5px] font-[500] tabular-nums text-[#0f1012]">
                  <Ghost size={11} />
                  0:58
                </span>
              </div>
            </div>
          </Float>

          {/* ── What Ghost Mannequin did to the shot above ── */}
          <Float className="hidden md:block z-20 md:left-[calc(50%-292px)] md:top-[234px] [--d:760ms] [--float:6.5s]">
            <div className="flex items-center gap-1.5 rounded-full bg-[#f6c9ee] px-3.5 py-2 text-[13px] font-[500] tracking-[-0.01em] text-[#0f1012]">
              <Check size={14} strokeWidth={2.5} />
              Model removed
            </div>
          </Float>

          {/* ── Time saved ── */}
          <Float className="z-20 left-[calc(50%-172px)] top-[278px] md:left-[calc(50%-556px)] md:top-[266px] [--d:880ms] [--float:8s]">
            <div className={cardZoom}>
              <div className="flex items-center gap-5 w-[236px] rounded-[18px] bg-[#fbe38a] px-5 py-4">
                <div className="flex items-end gap-[5px] h-[46px]">
                  {[0.62, 1, 0.46, 0.78].map((h, i) => (
                    <span
                      key={i}
                      className="bar-grow w-[11px] rounded-[2px] bg-[#3b2414]"
                      style={{ height: `${h * 100}%`, animationDelay: `${1100 + i * 90}ms` }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-[13px] tracking-[-0.01em] text-[#0f1012]/60">Time saved</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[30px] font-[500] leading-none tracking-[-0.04em] text-[#0f1012]">8 hrs</span>
                    <span className="w-[22px] h-[22px] rounded-full bg-[#0f1012] flex items-center justify-center">
                      <svg viewBox="0 0 10 10" className="w-2 h-2"><path d="M5 1.5L9 8H1z" fill="#fbe38a" /></svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Float>

          {/* ── Pattern Generator output ── */}
          <Float className="z-20 left-[calc(50%+3px)] top-[182px] md:left-[calc(50%+252px)] md:top-[10px] [--d:640ms] [--float:7s]">
            <div className={cardZoom}>
              <div className="relative w-[256px] h-[156px] rounded-[18px] bg-[#c9edbf] p-4 overflow-hidden">
                <div className="flex items-baseline gap-1.5 text-[#0f1012]">
                  <span className="text-[46px] font-[500] leading-none tracking-[-0.05em]">12</span>
                  <span className="text-[17px] tracking-[-0.02em]">pieces</span>
                </div>
                <p className="mt-1.5 text-[13px] tracking-[-0.01em] text-[#0f1012]/60">Drafted in 45s</p>
                <span className="absolute left-4 bottom-4 rounded-full bg-white px-3 py-1 text-[12px] font-[500] tracking-[-0.01em] text-[#0f1012]">
                  SVG + PDF
                </span>
                <PatternPieces className="absolute right-0 top-3 w-[118px] drop-shadow-[0_3px_4px_rgba(15,16,18,0.14)]" />
              </div>
            </div>
          </Float>

          {/* ── Shared with client ── */}
          <Float className="hidden md:block z-20 md:left-[calc(50%+384px)] md:top-[208px] [--d:1000ms] [--float:7.8s]">
            <div className="relative w-[200px] rounded-[18px] bg-white p-2 ring-1 ring-[#0f1012]/5 shadow-[0_22px_44px_-22px_rgba(15,16,18,0.35)]">
              <div className="relative h-[128px] overflow-hidden rounded-[12px]">
                <Image src="/hero/client-look.webp" alt="" fill sizes="184px" className="object-cover" />
              </div>
              <div className="flex items-center gap-3 px-1.5 pt-2.5 pb-1 text-[#0f1012]/40">
                <Heart size={15} className="fill-[#ef4444] text-[#ef4444]" />
                <MessageCircle size={15} />
                <Download size={15} />
                <Send size={15} className="ml-auto" />
              </div>
              <div className="absolute -left-2 top-[106px]">
                <div className="flex items-center gap-1 rounded-[10px] bg-[#3a2118] px-2.5 py-1.5 text-[12px] font-[500] tracking-[-0.01em] text-white">
                  <Check size={12} strokeWidth={2.75} />
                  Approved
                </div>
                <span className="absolute left-[22px] -bottom-[4px] w-2.5 h-2.5 rotate-45 rounded-[2px] bg-[#3a2118]" />
              </div>
            </div>
          </Float>
        </div>
      </div>
    </div>
  )
}
