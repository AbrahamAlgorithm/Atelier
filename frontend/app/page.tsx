import Link from 'next/link'
import { Ghost, Scissors, UserCircle2, ArrowRight, Clock, Check, ChevronDown, Zap, Shield, BarChart3, Sparkles } from 'lucide-react'
import { ProblemSection } from '@/components/ProblemSection'
import { SiteNav } from '@/components/landing/SiteNav'
import { Hero } from '@/components/landing/Hero'

// ── Data ─────────────────────────────────────────────────────────────────────

const tools = [
  {
    icon: Ghost,
    number: '01',
    title: 'Ghost Mannequin',
    headline: 'Studio-quality product shots. Without the studio.',
    description:
      'Upload a photo of a model wearing your garment. Our AI removes the person entirely and reconstructs the garment as a clean, hollow floating form — the industry-standard ghost mannequin effect used by every major fashion brand.',
    bullets: [
      'Removes model body completely, preserves garment shape',
      'Reconstructs interior detail at neckline and armholes',
      'Solid ivory background, no cleanup needed',
      'Export as high-res PNG, ready for your webstore',
    ],
    accent: '#8B6914',
    bg: 'bg-[#e8ddd0]',
    tag: 'Gemini AI',
    time: '~60 seconds',
  },
  {
    icon: Scissors,
    number: '02',
    title: 'Pattern Generator',
    headline: 'From photo to sewing pattern in one click.',
    description:
      'Point Atelier at any garment photo and it reverse-engineers the construction into a complete set of labeled pattern pieces — bodice front and back, sleeves, collar, skirt panels, facings — with seam allowances and grain lines included.',
    bullets: [
      'AI identifies all construction pieces automatically',
      'Generates properly labeled SVG files per piece',
      'Seam allowances and grain lines included',
      'Export as multi-page A4 PDF ready to print and cut',
    ],
    accent: '#0071e3',
    bg: 'bg-blue-50',
    tag: 'Gemini Vision',
    time: '~45 seconds',
  },
  {
    icon: UserCircle2,
    number: '03',
    title: 'Virtual Try-On',
    headline: 'See it on before it exists.',
    description:
      'Upload your garment design alongside a photo of your client or model. Atelier composites the outfit onto the body in a photorealistic way — no physical sample required. Pitch confidently, iterate instantly.',
    bullets: [
      'Photorealistic drape and fit simulation',
      'Works with flat-lay, model, or sketch photos',
      'Before/after slider comparison in the viewer',
      'Saves sampling costs on rejected designs',
    ],
    accent: '#0f1012',
    bg: 'bg-[#f2f2f4]',
    tag: 'IDM-VTON',
    time: '~90 seconds',
  },
]

const workflow = [
  {
    step: '01',
    label: 'Upload your image',
    desc: 'Drop any garment photo — model shot, flat-lay, or sketch. PNG, JPG up to 10MB.',
  },
  {
    step: '02',
    label: 'AI does the work',
    desc: 'Our models analyze fabric, structure, and construction details in seconds.',
  },
  {
    step: '03',
    label: 'Review and export',
    desc: 'Download high-res PNG, printable PDF patterns, or exportable SVGs.',
  },
]


const testimonials = [
  {
    quote:
      "I used to spend half my Monday morning retouching product photos for the website. Now I upload the shots at night and they're done by the time I wake up. Atelier has genuinely changed how I run my studio.",
    name: 'Amélie Fontaine',
    role: 'Independent Designer, Paris',
    initials: 'AF',
  },
  {
    quote:
      "The pattern generator isn't perfect for production, but it gives me a working draft in 45 seconds that I can refine rather than starting from scratch. It's cut my pattern-making time by 60%.",
    name: 'Marcus Webb',
    role: 'Fashion Lecturer & Designer, London',
    initials: 'MW',
  },
  {
    quote:
      "My clients kept rejecting samples because they couldn't visualize the finished piece from a sketch. Virtual try-on closed that gap completely. My approval rate went from 40% to over 80%.",
    name: 'Selin Arslan',
    role: 'Bridal Couture Designer, Istanbul',
    initials: 'SA',
  },
]

const faqs = [
  {
    q: 'What kind of photos work best?',
    a: 'Clear, well-lit front-facing photos work best. For Ghost Mannequin, a model wearing the garment against any background is ideal. For Pattern Generator, a flat-lay or standing model photo works well. For Virtual Try-On, a full-body front-facing photo of your model with arms slightly away from the body gives the best results.',
  },
  {
    q: 'How long does processing take?',
    a: 'Ghost Mannequin and Pattern Generator complete in 45–60 seconds. Virtual Try-On typically takes 60–90 seconds. All processing happens asynchronously — you can navigate away and come back, or wait on the page and watch the result appear.',
  },
  {
    q: 'What file formats can I export?',
    a: 'Ghost Mannequin exports as high-resolution PNG. Pattern Generator exports individual SVG files for each pattern piece plus a multi-page A4 PDF with all pieces laid out for printing. Virtual Try-On exports as PNG or JPG.',
  },
  {
    q: 'Can I save and come back to my work?',
    a: "Yes. Every job you run is saved to your account history. You can also click 'Save Project' on any completed result to give it a name and keep it in your Projects library for easy retrieval.",
  },
  {
    q: 'Are the pattern pieces production-ready?',
    a: "The patterns are AI-generated from visual analysis, so they're excellent for drafts, toiles, and starting points — but we recommend grading and checking them against body measurements before final production cutting. Think of it as a 60% head start on your draft.",
  },
  {
    q: 'How is my data handled?',
    a: 'Your uploaded images are stored privately in your account (AWS S3, encrypted at rest). They are not used to train any models and are not shared with third parties. You can delete your data at any time from your account settings.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes — Atelier is fully responsive and works on mobile browsers. Uploading from your phone camera, reviewing results, and exporting all work on mobile.',
  },
  {
    q: 'Is there a free plan?',
    a: "We're currently in early access. Create an account to get started — no credit card required. Pricing tiers will be introduced as the platform grows, and early users will receive preferential rates.",
  },
]

const comparisons = [
  { task: 'Ghost mannequin product shot', manual: '2–4 hours + photographer cost', atelier: '60 seconds, no extra cost' },
  { task: 'Pattern drafting from garment', manual: '1–3 days per design', atelier: '45 seconds draft to refine' },
  { task: 'Client try-on visualization', manual: 'Physical sample required', atelier: 'Virtual try-on from photo' },
  { task: 'Pattern file format', manual: 'Manual CAD export', atelier: 'SVG + PDF auto-generated' },
  { task: 'Revision turnaround', manual: 'Days per iteration', atelier: 'Seconds per re-upload' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5]">

      <SiteNav />
      <Hero />

      {/* ── Problem ── */}
      <ProblemSection />

      {/* ── Tools deep-dive ── */}
      <section id="tools" className="border-t border-[#0f1012]/6 py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-16">
            <p className="text-[11px] font-[400] tracking-[0.08em] text-[#8B6914] uppercase mb-4">The tools</p>
            <h2 className="text-[clamp(26px,3.5vw,40px)] font-[350] tracking-[-0.03em] leading-[1.1] text-[#0f1012]">
              Three tools. Everything you need.
            </h2>
          </div>

          <div className="space-y-6">
            {tools.map(({ icon: Icon, number, title, headline, description, bullets, accent, bg, tag, time }) => (
              <div key={title} className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[10px] overflow-hidden border border-[#0f1012]/8">
                {/* Left — info */}
                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-9 h-9 rounded-[8px] ${bg} flex items-center justify-center`}>
                      <Icon size={16} style={{ color: accent }} />
                    </div>
                    <span className="text-[11px] font-[400] tracking-[0.04em] text-[#8f8f8f] uppercase">{number} — {title}</span>
                    <span className="ml-auto text-[10px] font-[400] px-2 py-1 bg-[#f2f2f4] rounded-full text-[#8f8f8f]">{tag}</span>
                  </div>

                  <h3 className="text-[22px] font-[350] tracking-[-0.03em] leading-[1.15] text-[#0f1012] mb-4">{headline}</h3>
                  <p className="text-[14px] text-[#8f8f8f] tracking-[-0.02em] leading-relaxed mb-6">{description}</p>

                  <ul className="space-y-2.5">
                    {bullets.map(b => (
                      <li key={b} className="flex items-start gap-2.5">
                        <Check size={13} className="mt-0.5 shrink-0" style={{ color: accent }} />
                        <span className="text-[13px] text-[#0f1012] tracking-[-0.02em]">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right — visual placeholder */}
                <div className="bg-[#f2f2f4] flex items-center justify-center min-h-[260px] border-l border-[#0f1012]/8 p-10">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-[16px] ${bg} flex items-center justify-center mx-auto mb-4`}>
                      <Icon size={28} style={{ color: accent }} />
                    </div>
                    <div className="flex items-center gap-1.5 justify-center text-[#8f8f8f]">
                      <Clock size={11} />
                      <span className="text-[12px] tracking-[-0.01em]">{time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-[#0f1012] py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-lg mb-16">
            <p className="text-[11px] font-[400] tracking-[0.08em] text-[#8B6914] uppercase mb-4">How it works</p>
            <h2 className="text-[clamp(26px,3.5vw,40px)] font-[350] tracking-[-0.03em] leading-[1.1] text-[#faf9f5]">
              Upload. Process. Export.<br />That's it.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/8 rounded-[10px] overflow-hidden">
            {workflow.map(({ step, label, desc }) => (
              <div key={step} className="bg-[#0f1012] p-8 sm:p-10">
                <p className="text-[11px] font-[400] tracking-[0.06em] text-[#8B6914] mb-5">{step}</p>
                <p className="text-[18px] font-[350] tracking-[-0.02em] text-[#faf9f5] mb-3">{label}</p>
                <p className="text-[13px] text-[#8f8f8f] tracking-[-0.01em] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Zap, title: 'No design skills needed', desc: 'Just upload a photo. Atelier handles the technical work automatically.' },
              { icon: Shield, title: 'Your images stay private', desc: 'All uploads are encrypted and stored securely in your private account.' },
              { icon: BarChart3, title: 'Built for professional output', desc: 'Results match industry standards for e-commerce, pattern-making, and client presentations.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-8 h-8 rounded-[8px] bg-white/6 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-[#8B6914]" />
                </div>
                <div>
                  <p className="text-[14px] font-[400] tracking-[-0.02em] text-[#faf9f5] mb-1">{title}</p>
                  <p className="text-[12px] text-[#8f8f8f] tracking-[-0.01em] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="border-t border-[#0f1012]/6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-14">
            <p className="text-[11px] font-[400] tracking-[0.08em] text-[#8B6914] uppercase mb-4">The difference</p>
            <h2 className="text-[clamp(26px,3.5vw,40px)] font-[350] tracking-[-0.03em] leading-[1.1] text-[#0f1012]">
              Manual vs Atelier AI
            </h2>
          </div>

          <div className="rounded-[10px] overflow-hidden border border-[#0f1012]/8">
            <div className="grid grid-cols-[1fr_1fr_1fr] bg-[#0f1012] px-6 py-3 text-[11px] font-[400] tracking-[0.06em] uppercase">
              <span className="text-[#8f8f8f]">Task</span>
              <span className="text-[#8f8f8f]">Manual workflow</span>
              <span className="text-[#8B6914]">With Atelier AI</span>
            </div>
            {comparisons.map(({ task, manual, atelier }, i) => (
              <div
                key={task}
                className={`grid grid-cols-[1fr_1fr_1fr] px-6 py-4 gap-4 text-[13px] tracking-[-0.02em] border-t border-[#0f1012]/6 ${i % 2 === 0 ? 'bg-white' : 'bg-[#faf9f5]'}`}
              >
                <span className="text-[#0f1012] font-[400]">{task}</span>
                <span className="text-[#8f8f8f]">{manual}</span>
                <span className="text-[#0f1012] font-[400] flex items-center gap-1.5">
                  <Check size={12} className="text-[#8B6914] shrink-0" />{atelier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="stories" className="border-t border-[#0f1012]/6 bg-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-14">
            <p className="text-[11px] font-[400] tracking-[0.08em] text-[#8B6914] uppercase mb-4">Designers say</p>
            <h2 className="text-[clamp(26px,3.5vw,40px)] font-[350] tracking-[-0.03em] leading-[1.1] text-[#0f1012]">
              Built for people who make things.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ quote, name, role, initials }) => (
              <div key={name} className="p-8 rounded-[10px] border border-[#0f1012]/8 flex flex-col gap-6">
                <p className="text-[14px] text-[#0f1012] tracking-[-0.02em] leading-relaxed flex-1">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#e8ddd0] flex items-center justify-center">
                    <span className="text-[11px] font-[400] text-[#8B6914] tracking-[-0.01em]">{initials}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-[400] tracking-[-0.02em] text-[#0f1012]">{name}</p>
                    <p className="text-[11px] text-[#8f8f8f]">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-[#0f1012]/6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-[400] tracking-[0.08em] text-[#8B6914] uppercase mb-4">FAQ</p>
            <h2 className="text-[clamp(26px,3.5vw,40px)] font-[350] tracking-[-0.03em] leading-[1.1] text-[#0f1012]">
              Common questions
            </h2>
          </div>

          <div className="space-y-px rounded-[10px] overflow-hidden border border-[#0f1012]/8">
            {faqs.map(({ q, a }, i) => (
              <details
                key={q}
                className={`group ${i === 0 ? '' : 'border-t border-[#0f1012]/6'} bg-white`}
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none hover:bg-[#faf9f5] transition-colors">
                  <span className="text-[14px] font-[400] tracking-[-0.02em] text-[#0f1012]">{q}</span>
                  <ChevronDown size={14} className="text-[#8f8f8f] shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-[13px] text-[#8f8f8f] tracking-[-0.02em] leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-[#0f1012]/6 bg-[#0f1012] py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 mb-8">
            <Sparkles size={11} className="text-[#8B6914]" />
            <span className="text-[11px] font-[400] text-[#8f8f8f] tracking-[-0.01em]">Free to get started</span>
          </div>

          <h2 className="text-[clamp(30px,4.5vw,56px)] font-[350] tracking-[-0.04em] leading-[1.05] text-[#faf9f5] mb-6">
            Stop doing manually what<br />AI can do in seconds.
          </h2>

          <p className="text-[16px] text-[#8f8f8f] tracking-[-0.02em] leading-relaxed mb-10 max-w-lg mx-auto">
            Join designers using Atelier to cut production time, reduce sampling costs, and deliver better work to clients faster.
          </p>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-9 py-4.5 text-[15px] font-[400] tracking-[-0.02em] bg-[#8B6914] text-white rounded-[10px] hover:bg-[#7a5c11] transition-colors"
          >
            Create your free account <ArrowRight size={15} />
          </Link>

          <p className="text-[12px] text-[#8f8f8f]/60 mt-5 tracking-[-0.01em]">No credit card · No setup · Results in under 90 seconds</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 bg-[#0f1012] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[350] tracking-[-0.28px] text-[#faf9f5]">Atelier</span>
            <span className="text-[9px] text-[#8B6914] font-[400] bg-[#8B6914]/20 px-1.5 py-0.5 rounded-full">AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#tools" className="text-[12px] text-[#8f8f8f] hover:text-[#faf9f5] transition-colors tracking-[-0.01em]">Tools</a>
            <a href="#how-it-works" className="text-[12px] text-[#8f8f8f] hover:text-[#faf9f5] transition-colors tracking-[-0.01em]">How it works</a>
            <a href="#faq" className="text-[12px] text-[#8f8f8f] hover:text-[#faf9f5] transition-colors tracking-[-0.01em]">FAQ</a>
          </div>
          <p className="text-[12px] text-[#8f8f8f]/60 tracking-[-0.01em]">© 2025 Atelier AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
