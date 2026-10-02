import Link from 'next/link'
import { AtelierMark } from './AtelierMark'

const columns = [
  {
    title: 'Product',
    links: [
      { href: '#preview', label: 'Virtual Try-On' },
      { href: '#pattern', label: 'Pattern Generator' },
      { href: '#publish', label: 'Ghost Mannequin' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { href: '#how-it-works', label: 'How It Works' },
      { href: '#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign In' },
      { href: '/register', label: 'Get Started' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="overflow-hidden pt-20 sm:pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Atelier home">
              <AtelierMark className="w-8 h-8" />
              <span className="font-serif text-[23px] leading-none tracking-[-0.02em] text-[#0f1012]">Atelier</span>
            </Link>
            <p className="mt-4 max-w-[260px] text-[14px] leading-[1.6] tracking-[-0.01em] text-[#0f1012]/55">
              The AI atelier for independent fashion designers.
            </p>
          </div>
          {columns.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <p className="text-[12px] font-[500] uppercase tracking-[0.14em] text-[#0f1012]/40">{title}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-[14px] tracking-[-0.01em] text-[#0f1012]/70 hover:text-[#0f1012] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-[#0f1012]/8 pt-6 text-[12.5px] tracking-[-0.01em] text-[#0f1012]/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Atelier AI. All rights reserved.</p>
          <p>Made for the people who make fashion.</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="mt-10 select-none text-center font-serif text-[clamp(96px,24vw,360px)] leading-[0.78] tracking-[-0.04em] text-[#0f1012]/[0.05] translate-y-[8%]"
      >
        Atelier
      </p>
    </footer>
  )
}
