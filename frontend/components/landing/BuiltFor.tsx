import { Check, Gem, GraduationCap, Scissors, Shirt, ShoppingBag, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SectionHeader } from './SectionHeader'

const personas = [
  {
    title: 'Independent labels',
    desc: 'Take a collection from sketch to store without a sample room, a pattern cutter or a photo studio.',
    icon: Shirt,
    bg: 'bg-[linear-gradient(140deg,#fdf6dc_0%,#f8e7a8_100%)]',
    chip: { icon: Sparkles, text: 'Sketch to store' },
    tools: ['All three tools'],
  },
  {
    title: 'Bridal & custom designers',
    desc: 'Show clients the finished piece on their own photo before you cut a single panel.',
    icon: Gem,
    bg: 'bg-[linear-gradient(140deg,#fcedf6_0%,#f4cde3_100%)]',
    chip: { icon: Check, text: 'Client approved' },
    tools: ['Virtual Try-On'],
  },
  {
    title: 'Students & educators',
    desc: 'See how real garments are constructed, piece by piece, and practise drafting from any photo.',
    icon: GraduationCap,
    bg: 'bg-[linear-gradient(140deg,#eef7ea_0%,#cbe8c0_100%)]',
    chip: { icon: Scissors, text: 'Pattern drafted' },
    tools: ['Pattern Generator'],
  },
  {
    title: 'Online boutiques',
    desc: 'Consistent, studio-quality product shots for every listing, without booking a shoot.',
    icon: ShoppingBag,
    bg: 'bg-[linear-gradient(140deg,#f1f5fa_0%,#d5e1ee_100%)]',
    chip: { icon: Check, text: 'Listings ready' },
    tools: ['Ghost Mannequin'],
  },
]

export function BuiltFor() {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Who it's for"
          title="Made for the people who make fashion."
          subtitle="Whether you run a label, dress brides or teach the craft, Atelier takes the production work off your desk."
        />

        <div className="mt-14 sm:mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map(({ title, desc, icon: Icon, bg, chip, tools }, i) => (
            <article key={title} className="reveal flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-[#0f1012]/6">
              <div className={cn('relative h-[168px] flex items-center justify-center overflow-hidden', bg)}>
                <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className="absolute -right-12 -bottom-16 w-[220px]">
                  <circle cx="100" cy="100" r="70" stroke="#0f1012" strokeOpacity="0.07" />
                  <circle cx="100" cy="100" r="96" stroke="#0f1012" strokeOpacity="0.05" />
                </svg>
                <span className="relative w-16 h-16 rounded-[20px] bg-white/85 backdrop-blur flex items-center justify-center ring-1 ring-[#0f1012]/5 shadow-[0_16px_32px_-18px_rgba(15,16,18,0.5)]">
                  <Icon size={26} strokeWidth={1.6} className="text-[#0f1012]" />
                </span>
                <span
                  className="drift absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-[500] tracking-[-0.01em] text-[#0f1012] shadow-[0_10px_20px_-12px_rgba(15,16,18,0.45)]"
                  style={{ '--float': `${6.5 + i * 0.6}s` } as React.CSSProperties}
                >
                  <chip.icon size={12} strokeWidth={2.25} />
                  {chip.text}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[18px] font-[500]! tracking-[-0.02em] text-[#0f1012]">{title}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-[1.6] tracking-[-0.01em] text-[#0f1012]/55">{desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {tools.map(tool => (
                    <span key={tool} className="rounded-full bg-[#faf9f5] px-2.5 py-1 text-[11.5px] tracking-[-0.01em] text-[#0f1012]/65 ring-1 ring-[#0f1012]/8">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
