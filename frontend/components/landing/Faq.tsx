import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const faqs = [
  {
    q: 'What kind of photos work best?',
    a: 'Clear, well-lit, front-facing photos. For Ghost Mannequin, a model wearing the garment against any background. For Pattern Generator, a flat-lay or a standing model. For Virtual Try-On, a full-body photo of your client or model with arms slightly away from the body.',
  },
  {
    q: 'How long does it take?',
    a: 'Pattern drafts and ghost mannequin shots are ready in under a minute, and virtual try-ons in about 90 seconds. Jobs run in the background, so you can keep working and come back to the result.',
  },
  {
    q: 'What can I export?',
    a: 'Ghost mannequin shots as high-resolution PNGs. Patterns as an SVG per piece, plus a multi-page A4 PDF ready to print and cut. Try-ons as PNG or JPG.',
  },
  {
    q: 'Is my work saved?',
    a: 'Yes. Every job is saved to your history, and you can save any result as a named project to find it again later.',
  },
  {
    q: 'Are the patterns ready for production?',
    a: 'Every pattern is a complete first draft, with labelled pieces, seam allowances and grain lines. As with any draft, check the fit against your measurements and grade it before cutting production fabric.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. Atelier works in any modern mobile browser, so you can upload straight from your camera, review results and export on the go.',
  },
  {
    q: 'Can I try it for free?',
    a: 'Yes. Create an account and start designing, no credit card required.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 py-24 sm:py-32 border-t border-[#0f1012]/6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 self-start">
          <SectionHeader
            align="left"
            eyebrow="FAQ"
            title="Questions, answered."
            subtitle="Everything you need to know before your first upload."
          />
          <Link
            href="/register"
            className="reveal group mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#0f1012] text-[15px] tracking-[-0.01em] text-[#faf9f5] hover:bg-[#2a2c30] transition-colors"
          >
            Start Designing Free
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="reveal border-y border-[#0f1012]/8 divide-y divide-[#0f1012]/8">
          {faqs.map(({ q, a }) => (
            <details key={q} className="faq-item group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[16px] sm:text-[17px] font-[500] tracking-[-0.02em] text-[#0f1012] [&::-webkit-details-marker]:hidden">
                {q}
                <span className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full ring-1 ring-[#0f1012]/12 text-[#0f1012] transition-[rotate,background-color] duration-300 group-open:rotate-45 group-open:bg-[#0f1012] group-open:text-[#faf9f5]">
                  <Plus size={15} />
                </span>
              </summary>
              <p className="pb-6 pr-12 text-[15px] leading-[1.65] tracking-[-0.01em] text-[#0f1012]/60">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
