import { Fragment } from 'react'
import Image from 'next/image'
import { Check, Clock, Ghost, Scissors, Sparkles, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SectionHeader } from './SectionHeader'
import { BlazerFlat } from './BlazerFlat'
import { BlazerPattern } from './BlazerPattern'

// Visuals are drawn inside a @container box and sized in cqw, so each scene
// scales as one piece from phone to desktop.
const chip =
  'absolute flex items-center gap-[1cqw] whitespace-nowrap rounded-full bg-white px-[2.4cqw] py-[1.3cqw] text-[length:max(10px,2cqw)] font-[500] tracking-[-0.01em] text-[#0f1012] ring-1 ring-[#0f1012]/5 shadow-[0_12px_28px_-16px_rgba(15,16,18,0.4)]'

function Arcs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className={cn('absolute pointer-events-none', className)}>
      <circle cx="400" cy="400" r="220" stroke="#0f1012" strokeOpacity="0.07" />
      <circle cx="400" cy="400" r="290" stroke="#0f1012" strokeOpacity="0.05" />
    </svg>
  )
}

function PreviewVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 bg-[linear-gradient(140deg,#fcedf6_0%,#f4cde3_100%)] overflow-hidden">
      <Arcs className="right-0 bottom-0 w-[80%]" />
      <div className="@container relative w-full max-w-[520px] aspect-[6/5]">
        <div className="absolute left-0 top-[9%] w-[45%] rotate-[-4deg] rounded-[3cqw] bg-white p-[2.6cqw] ring-1 ring-[#0f1012]/6 shadow-[0_20px_40px_-24px_rgba(15,16,18,0.35)]">
          <div className="flex items-center justify-between text-[length:max(9px,1.9cqw)]">
            <span className="font-[500] text-[#0f1012]">Your design</span>
            <span className="tracking-[0.1em] text-[#0f1012]/40">SKETCH</span>
          </div>
          <BlazerFlat className="mt-[1.6cqw] w-full" />
        </div>

        <svg viewBox="0 0 100 40" fill="none" aria-hidden="true" className="absolute left-[37%] top-[1%] w-[20%]">
          <path d="M4 34C26 4 70 2 94 20" stroke="#0f1012" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M86 14L95 21L84 24" stroke="#0f1012" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={cn(chip, 'z-10 left-[33%] -top-[6%]')}>
          <Sparkles className="w-[max(11px,2.2cqw)] h-[max(11px,2.2cqw)] text-[#8B6914]" />
          Atelier
        </span>

        <div className="absolute right-0 top-0 w-[50%] aspect-[4/5] rotate-[3deg] rounded-[3.4cqw] overflow-hidden ring-[0.8cqw] ring-white shadow-[0_30px_60px_-28px_rgba(15,16,18,0.5)]">
          <Image src="/workflow/preview-on-model.webp" alt="" fill sizes="(max-width: 1024px) 50vw, 280px" className="object-cover" />
          <span className="absolute left-[3cqw] bottom-[3cqw] rounded-full bg-white/85 backdrop-blur-md px-[2cqw] py-[1cqw] text-[length:max(9px,1.8cqw)] font-[500] text-[#0f1012]">
            On your client
          </span>
        </div>

        <span className={cn(chip, 'drift left-[14%] bottom-[2%] [--float:7s]')}>
          <span className="flex items-center justify-center w-[max(14px,2.8cqw)] h-[max(14px,2.8cqw)] rounded-full bg-[#16a34a] text-white">
            <Check className="w-[70%] h-[70%]" strokeWidth={3} />
          </span>
          Fit preview ready · 1:24
        </span>
      </div>
    </div>
  )
}

function PatternVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 bg-[linear-gradient(140deg,#eef7ea_0%,#cbe8c0_100%)] overflow-hidden">
      <Arcs className="left-0 bottom-0 w-[80%] -scale-x-100" />
      <div className="@container relative w-full max-w-[560px] aspect-[4/3]">
        <div className="draw-in absolute inset-x-[3%] top-[7%] bottom-0 rounded-[2cqw] bg-[#fffdf7] p-[1.6cqw] ring-1 ring-[#0f1012]/8 shadow-[0_30px_60px_-34px_rgba(15,16,18,0.5)]">
          <BlazerPattern className="w-full h-full" />
        </div>

        <div className="absolute -left-[2%] -top-[2%] w-[22%] rotate-[-6deg] rounded-[2.4cqw] bg-white p-[1cqw] ring-1 ring-[#0f1012]/6 shadow-[0_18px_36px_-20px_rgba(15,16,18,0.45)]">
          <div className="relative aspect-square overflow-hidden rounded-[1.6cqw]">
            <Image src="/workflow/pattern-source.webp" alt="" fill sizes="130px" className="object-cover" />
          </div>
          <p className="mt-[0.8cqw] text-center text-[length:max(9px,1.7cqw)] text-[#0f1012]/55">Source photo</p>
        </div>

        <span className={cn(chip, 'drift right-[1%] -top-[3%] [--float:7.5s]')}>
          <Scissors className="w-[max(11px,2.2cqw)] h-[max(11px,2.2cqw)]" />
          7 pattern pieces
        </span>
        <span className={cn(chip, 'drift right-[7%] -bottom-[5%] bg-[#0f1012] text-[#faf9f5] [--float:8s]')}>
          SVG + print-ready PDF
        </span>
      </div>
    </div>
  )
}

function PublishVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 bg-[linear-gradient(140deg,#f1f5fa_0%,#d5e1ee_100%)] overflow-hidden">
      <Arcs className="right-0 bottom-0 w-[80%]" />
      <div className="@container relative w-full max-w-[560px] aspect-[5/4]">
        <div className="absolute inset-x-0 top-[6%] bottom-[2%] flex flex-col overflow-hidden rounded-[2.6cqw] bg-white ring-1 ring-[#0f1012]/8 shadow-[0_34px_70px_-36px_rgba(15,16,18,0.55)]">
          <div className="flex items-center gap-[1cqw] h-[8.5cqw] px-[2.6cqw] border-b border-[#0f1012]/6">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-[1.4cqw] h-[1.4cqw] rounded-full bg-[#0f1012]/12" />
            ))}
            <span className="mx-auto rounded-full bg-[#0f1012]/[0.04] px-[2.6cqw] py-[0.7cqw] text-[length:max(9px,1.7cqw)] text-[#0f1012]/45">
              yourlabel.com/shop
            </span>
          </div>
          <div className="flex-1 grid grid-cols-[1.05fr_1fr] gap-[3.4cqw] p-[3.4cqw]">
            <div className="relative overflow-hidden rounded-[1.8cqw] bg-[#efe6d4]">
              <Image src="/hero/ghost-garment.webp" alt="" fill sizes="(max-width: 1024px) 45vw, 260px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <p className="text-[length:max(8px,1.5cqw)] uppercase tracking-[0.14em] text-[#0f1012]/40">New in</p>
              <p className="mt-[1.2cqw] font-serif text-[length:max(13px,3.6cqw)] leading-[1.1] text-[#0f1012]">Printed Camp Shirt</p>
              <p className="mt-[1.2cqw] text-[length:max(10px,2.2cqw)] text-[#0f1012]/60">$120</p>
              <div className="mt-[2.6cqw] flex gap-[1.2cqw]">
                {['bg-[#efe9df]', 'bg-[#2b2b2b]', 'bg-[#9fb3c8]'].map((c, i) => (
                  <span key={c} className={cn('w-[3cqw] h-[3cqw] rounded-full ring-1 ring-[#0f1012]/10', c, i === 0 && 'ring-2 ring-[#0f1012] ring-offset-2')} />
                ))}
              </div>
              <div className="mt-[2.6cqw] flex gap-[1cqw]">
                {['S', 'M', 'L'].map(s => (
                  <span
                    key={s}
                    className={cn(
                      'flex items-center justify-center w-[5cqw] h-[5cqw] rounded-[1cqw] text-[length:max(9px,1.7cqw)] ring-1',
                      s === 'M' ? 'bg-[#0f1012] text-[#faf9f5] ring-[#0f1012]' : 'text-[#0f1012]/60 ring-[#0f1012]/12'
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-[3cqw] space-y-[1cqw]">
                {['w-full', 'w-[88%]', 'w-[64%]'].map(w => (
                  <div key={w} className={cn('h-[0.9cqw] rounded-full bg-[#0f1012]/[0.07]', w)} />
                ))}
              </div>
              <span className="mt-auto rounded-full bg-[#0f1012] py-[1.6cqw] text-center text-[length:max(9px,1.9cqw)] text-[#faf9f5]">
                Add to bag
              </span>
            </div>
          </div>
        </div>

        <span className={cn(chip, 'drift -left-[3%] top-[30%] [--float:7.5s]')}>
          <Ghost className="w-[max(11px,2.2cqw)] h-[max(11px,2.2cqw)]" />
          Model removed · 0:58
        </span>
        <span className={cn(chip, 'drift right-[4%] -top-[1%] [--float:8.5s]')}>
          <span className="w-[1.6cqw] h-[1.6cqw] min-w-[6px] min-h-[6px] rounded-full bg-[#16a34a]" />
          Live in your store
        </span>
      </div>
    </div>
  )
}

const stages = [
  {
    id: 'preview',
    n: '01',
    verb: 'Preview',
    tool: 'Virtual Try-On',
    icon: UserCircle2,
    tile: 'bg-[#f6d3ec]',
    title: 'Preview it on a real person.',
    body: 'Pair your sketch or sample with a photo of your client or model and see the piece on them, photoreal, in about 90 seconds. Get the yes before you cut a single panel.',
    points: ['Works from sketches, flat-lays or photos', 'Photorealistic drape and fit', 'Before and after, side by side'],
    meta: 'About 90 seconds · PNG or JPG',
    visual: <PreviewVisual />,
  },
  {
    id: 'pattern',
    n: '02',
    verb: 'Pattern',
    tool: 'Pattern Generator',
    icon: Scissors,
    tile: 'bg-[#cfeac6]',
    title: 'Pattern it in under a minute.',
    body: 'Atelier reads the construction of any garment photo and drafts every piece — fronts, backs, sleeves, collar and facings — labelled and ready to refine.',
    points: ['Every construction piece, labelled', 'Seam allowances and grain lines included', 'An SVG per piece, plus a print-ready A4 PDF'],
    meta: 'About 45 seconds · SVG + PDF',
    visual: <PatternVisual />,
  },
  {
    id: 'publish',
    n: '03',
    verb: 'Publish',
    tool: 'Ghost Mannequin',
    icon: Ghost,
    tile: 'bg-[#dfe7f1]',
    title: 'Publish it with studio-quality shots.',
    body: 'Upload a photo of the garment being worn. Atelier removes the model, rebuilds the inside of the neckline and armholes, and hands back a clean product shot for your store.',
    points: ['Model removed, garment shape kept', 'Interior detail reconstructed', 'High-res PNG on a clean background'],
    meta: 'About 60 seconds · High-res PNG',
    visual: <PublishVisual />,
  },
]

export function Workflow() {
  return (
    <section id="tools" className="scroll-mt-16 py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="The workflow"
          title={<>Preview it. Pattern it. <br className="hidden sm:block" />Publish it.</>}
          subtitle="Take a garment from idea to online store. Atelier handles the production work at every stage, so you can stay on the design."
        />

        <ol className="reveal mt-10 flex items-center justify-center">
          {stages.map(({ id, verb, icon: Icon, tile }, i) => (
            <Fragment key={id}>
              <li>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 sm:pr-4 ring-1 ring-[#0f1012]/8 hover:ring-[#0f1012]/20 transition-shadow"
                >
                  <span className={cn('w-7 h-7 rounded-full flex items-center justify-center', tile)}>
                    <Icon size={14} className="text-[#0f1012]" />
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-[500] tracking-[-0.01em] text-[#0f1012]">{verb}</span>
                </a>
              </li>
              {i < stages.length - 1 && (
                <li aria-hidden="true" className="w-4 sm:w-12 h-px bg-[repeating-linear-gradient(to_right,#0f1012_0_4px,transparent_4px_8px)] opacity-25" />
              )}
            </Fragment>
          ))}
        </ol>

        <div className="mt-12 sm:mt-16 space-y-6">
          {stages.map(({ id, n, tool, icon: Icon, tile, title, body, points, meta, visual }, i) => (
            <article
              key={id}
              id={id}
              className="reveal scroll-mt-24 grid lg:grid-cols-[0.92fr_1.08fr] overflow-hidden rounded-[32px] bg-white ring-1 ring-[#0f1012]/6 shadow-[0_40px_80px_-60px_rgba(15,16,18,0.35)]"
            >
              <div className={cn('flex flex-col justify-center p-7 sm:p-10 lg:p-14', i % 2 === 1 && 'lg:order-2')}>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-[15px] text-[#0f1012]/35">{n}</span>
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-[500] text-[#0f1012]', tile)}>
                    <Icon size={13} />
                    {tool}
                  </span>
                </div>
                <h3 className="mt-5 font-serif font-[400]! text-[clamp(28px,3.2vw,40px)] leading-[1.08]! text-[#0f1012]">{title}</h3>
                <p className="mt-4 text-[15px] sm:text-[16px] leading-[1.6] tracking-[-0.01em] text-[#0f1012]/60">{body}</p>
                <ul className="mt-6 space-y-2.5">
                  {points.map(point => (
                    <li key={point} className="flex items-center gap-2.5 text-[14px] tracking-[-0.01em] text-[#0f1012]">
                      <span className={cn('w-5 h-5 shrink-0 rounded-full flex items-center justify-center', tile)}>
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 pt-6 border-t border-[#0f1012]/8 flex items-center gap-2 text-[13px] tracking-[-0.01em] text-[#0f1012]/50">
                  <Clock size={14} />
                  {meta}
                </p>
              </div>
              <div className={cn('relative min-h-[340px] sm:min-h-[460px]', i % 2 === 1 && 'lg:order-1')}>{visual}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
