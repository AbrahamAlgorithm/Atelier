import Image from 'next/image'
import { Check, CircleCheck, CloudUpload, Download, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SectionHeader } from './SectionHeader'

function UploadScene() {
  return (
    <div className="relative h-full flex items-center justify-center">
      <div className="w-[80%] h-[72%] pb-10 rounded-[16px] border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/45">
        <CloudUpload size={24} strokeWidth={1.5} />
        <span className="text-[12px] tracking-[-0.01em]">Drop a garment photo</span>
      </div>
      <div className="drift absolute right-[8%] bottom-[10%] flex items-center gap-2.5 rounded-[12px] bg-white py-2 pl-2 pr-3 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6)] [--float:6.5s]">
        <div className="relative w-9 h-9 overflow-hidden rounded-[8px]">
          <Image src="/workflow/pattern-source.webp" alt="" fill sizes="36px" className="object-cover" />
        </div>
        <div>
          <p className="text-[11.5px] font-[500] tracking-[-0.01em] text-[#0f1012]">blazer.jpg</p>
          <div className="mt-1.5 h-1 w-20 rounded-full bg-[#0f1012]/10 overflow-hidden">
            <div className="h-full w-full rounded-full bg-[#16a34a]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessScene() {
  return (
    <div className="relative h-full flex items-center gap-5 px-6">
      <div className="relative w-[38%] aspect-[3/4] overflow-hidden rounded-[12px] ring-1 ring-white/10">
        <Image src="/workflow/preview-on-model.webp" alt="" fill sizes="120px" className="object-cover" />
        <div className="scan-loop absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-white/25" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
      <ul className="flex-1 space-y-2.5 text-[12.5px] tracking-[-0.01em]">
        <li className="flex items-center gap-2 text-white/80">
          <CircleCheck size={15} className="text-[#86efac]" />
          Garment detected
        </li>
        <li className="flex items-center gap-2 text-white/80">
          <CircleCheck size={15} className="text-[#86efac]" />
          Construction mapped
        </li>
        <li className="flex items-center gap-2 text-white/55">
          <LoaderCircle size={15} className="animate-spin motion-reduce:animate-none" />
          Rendering
        </li>
        <li className="pt-2 text-[11.5px] tabular-nums text-white/35">0:42 elapsed</li>
      </ul>
    </div>
  )
}

function ExportScene() {
  const files = [
    { ext: 'PNG', tag: 'bg-[#dfe7f1]', note: 'Product shot' },
    { ext: 'SVG', tag: 'bg-[#cfeac6]', note: 'Pattern pieces' },
    { ext: 'PDF', tag: 'bg-[#f6d3ec]', note: 'A4, ready to print' },
  ]
  return (
    <div className="relative h-full flex items-center justify-center gap-3 pb-6">
      {files.map(({ ext, tag, note }, i) => (
        <div
          key={ext}
          className={cn(
            'w-[26%] aspect-[3/4] flex flex-col justify-between rounded-[12px] bg-white p-2.5 shadow-[0_16px_32px_-14px_rgba(0,0,0,0.6)]',
            i === 1 && '-translate-y-3'
          )}
        >
          <span className={cn('self-start rounded-[6px] px-1.5 py-0.5 text-[10px] font-[600] tracking-[0.04em] text-[#0f1012]', tag)}>{ext}</span>
          <div>
            <div className="h-1 w-full rounded-full bg-[#0f1012]/8" />
            <div className="mt-1 h-1 w-2/3 rounded-full bg-[#0f1012]/8" />
            <p className="mt-2 text-[9.5px] leading-tight text-[#0f1012]/45">{note}</p>
          </div>
        </div>
      ))}
      <span className="absolute bottom-[9%] left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-[12px] text-white/80 ring-1 ring-white/10">
        <Download size={13} />
        Download all
      </span>
    </div>
  )
}

const steps = [
  {
    title: 'Upload a photo',
    desc: 'A model shot, a flat-lay or a sketch. Straight from your camera roll, up to 10 MB.',
    scene: <UploadScene />,
  },
  {
    title: 'Atelier does the production work',
    desc: 'It reads fabric, structure and construction, then builds your result in about a minute.',
    scene: <ProcessScene />,
  },
  {
    title: 'Export and share',
    desc: 'High-res PNGs, an SVG per pattern piece and print-ready PDFs, saved to your projects.',
    scene: <ExportScene />,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-16 overflow-hidden bg-[#0f1012] py-24 sm:py-32">
      <div aria-hidden="true" className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[420px] rounded-b-[999px] bg-[radial-gradient(closest-side,rgba(196,168,130,0.16),transparent)]" />
      <svg viewBox="0 0 1000 500" fill="none" aria-hidden="true" className="absolute left-1/2 -top-[260px] -translate-x-1/2 w-[1000px] pointer-events-none">
        <circle cx="500" cy="0" r="420" stroke="#faf9f5" strokeOpacity="0.06" />
        <circle cx="500" cy="0" r="500" stroke="#faf9f5" strokeOpacity="0.04" />
      </svg>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          dark
          eyebrow="How it works"
          title="Upload a photo. Atelier does the rest."
          subtitle="No CAD software, no studio booking and no waiting on samples. Just a photo and about a minute."
        />

        <ol className="mt-14 sm:mt-16 grid gap-4 md:grid-cols-3">
          {steps.map(({ title, desc, scene }, i) => (
            <li key={title} className="reveal rounded-[24px] bg-white/[0.04] p-3 ring-1 ring-white/10">
              <div className="relative h-[200px] overflow-hidden rounded-[18px] bg-white/[0.03] ring-1 ring-white/5">{scene}</div>
              <div className="px-4 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-[15px] text-[#faf9f5]/35">0{i + 1}</span>
                  <h3 className="text-[18px] font-[500]! tracking-[-0.02em] text-[#faf9f5]">{title}</h3>
                </div>
                <p className="mt-2.5 text-[14px] leading-[1.6] tracking-[-0.01em] text-[#faf9f5]/55">{desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <ul className="reveal mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13.5px] tracking-[-0.01em] text-[#faf9f5]/60">
          {['No design or CAD skills needed', 'Results in under 90 seconds', 'Every result saved to your projects'].map(item => (
            <li key={item} className="flex items-center gap-2">
              <Check size={14} className="text-[#C4A882]" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
