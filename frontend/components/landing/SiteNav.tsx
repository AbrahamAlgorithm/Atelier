'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChevronDown, Ghost, Menu, Scissors, UserCircle2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { AtelierMark } from './AtelierMark'

const toolLinks = [
  { icon: Ghost, title: 'Ghost Mannequin', desc: 'Studio product shots without the studio', bg: 'bg-[#dfe7f1]' },
  { icon: Scissors, title: 'Pattern Generator', desc: 'Photo to printable sewing pattern', bg: 'bg-[#cfeac6]' },
  { icon: UserCircle2, title: 'Virtual Try-On', desc: 'See the garment on before it exists', bg: 'bg-[#f6d3ec]' },
]

const links = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#stories', label: 'Stories' },
  { href: '#faq', label: 'FAQ' },
]

// Shared by the mobile menu's slide-in and its staggered items.
const menuEase = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // While the mobile menu is open: lock page scroll, keep keyboard focus inside it,
  // close on Escape or once the viewport reaches desktop, then hand focus back.
  useEffect(() => {
    if (!open) return
    const menuButton = menuButtonRef.current
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!panelRef.current.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 768px)')
    const onViewportChange = () => desktop.matches && setOpen(false)

    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onViewportChange)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onViewportChange)
      menuButton?.focus()
    }
  }, [open])

  const close = () => setOpen(false)

  // Menu items slide in one after another on open and leave together on close.
  const reveal = cn(
    'transition duration-500 motion-reduce:transition-none',
    menuEase,
    open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
  )
  const revealDelay = (i: number) => ({ transitionDelay: open ? `${140 + i * 45}ms` : '0ms' })

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-[background-color,box-shadow] duration-300',
          scrolled ? 'bg-[#faf9f5]/85 backdrop-blur-xl shadow-[0_1px_0_rgba(15,16,18,0.06)]' : 'bg-transparent'
        )}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="flex items-center gap-2.5 justify-self-start" aria-label="Atelier home">
            <AtelierMark className="w-8 h-8" />
            <span className="font-serif text-[23px] leading-none tracking-[-0.02em] text-[#0f1012]">Atelier</span>
            <span className="hidden lg:inline text-[13px] tracking-[-0.01em] text-[#0f1012]/40">/ AI design studio</span>
          </Link>

          {/* ── Centre links ── */}
          <div className="hidden md:flex items-center gap-1">
            <div className="relative group">
              <a
                href="#tools"
                className="flex items-center gap-1 px-3 py-2 text-[14px] tracking-[-0.01em] text-[#0f1012]/70 hover:text-[#0f1012] transition-colors"
              >
                Tools
                <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
              </a>
              <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-2">
                <div className="w-[320px] rounded-[18px] bg-white p-2 ring-1 ring-[#0f1012]/6 shadow-[0_24px_48px_-20px_rgba(15,16,18,0.25)]">
                  {toolLinks.map(({ icon: Icon, title, desc, bg }) => (
                    <a key={title} href="#tools" className="flex items-center gap-3 rounded-[12px] p-2.5 hover:bg-[#faf9f5] transition-colors">
                      <span className={cn('w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0', bg)}>
                        <Icon size={16} className="text-[#0f1012]" />
                      </span>
                      <span>
                        <span className="block text-[13px] font-[500] tracking-[-0.01em] text-[#0f1012]">{title}</span>
                        <span className="block text-[12px] tracking-[-0.01em] text-[#0f1012]/50">{desc}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-3 py-2 text-[14px] tracking-[-0.01em] text-[#0f1012]/70 hover:text-[#0f1012] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1 sm:gap-2 justify-self-end">
            <Link href="/login" className="hidden sm:inline-flex px-3 py-2 text-[14px] tracking-[-0.01em] text-[#0f1012]/70 hover:text-[#0f1012] transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center h-10 px-5 rounded-full bg-[#0f1012] text-[14px] tracking-[-0.01em] text-[#faf9f5] hover:bg-[#2a2c30] transition-colors"
            >
              Get Started
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="md:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-[#0f1012] hover:bg-[#0f1012]/5 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile menu: full-screen panel that slides in from the right ──
          Rendered beside the header rather than inside it: the header's
          backdrop-filter would otherwise trap this fixed overlay in its box.
          Visible at once on open (so focus can move in); hidden only after
          the 500ms slide-out on close. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn('fixed inset-0 z-[60] md:hidden transition-[visibility] duration-0', open ? 'visible' : 'invisible delay-500')}
      >
        <div
          onClick={close}
          className={cn('absolute inset-0 bg-[#0f1012]/30 transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')}
        />

        <div
          ref={panelRef}
          className={cn(
            'absolute inset-0 flex flex-col bg-[#faf9f5] transition-transform duration-500 motion-reduce:transition-none',
            menuEase,
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="shrink-0 h-16 sm:h-[72px] px-4 sm:px-6 flex items-center justify-between">
            <Link href="/" onClick={close} className="flex items-center gap-2.5" aria-label="Atelier home">
              <AtelierMark className="w-8 h-8" />
              <span className="font-serif text-[23px] leading-none tracking-[-0.02em] text-[#0f1012]">Atelier</span>
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="w-10 h-10 -mr-1 flex items-center justify-center rounded-full bg-[#0f1012]/5 text-[#0f1012] hover:bg-[#0f1012]/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5 pb-8">
            <p className={cn('mb-3 text-[11px] font-[500] uppercase tracking-[0.14em] text-[#0f1012]/40', reveal)} style={revealDelay(0)}>
              Tools
            </p>
            <ul className="space-y-2">
              {toolLinks.map(({ icon: Icon, title, desc, bg }, i) => (
                <li key={title} className={reveal} style={revealDelay(i + 1)}>
                  <a
                    href="#tools"
                    onClick={close}
                    className="flex items-center gap-3 rounded-[18px] bg-white p-3 ring-1 ring-[#0f1012]/6 shadow-[0_8px_24px_-16px_rgba(15,16,18,0.2)] active:scale-[0.98] transition-transform"
                  >
                    <span className={cn('w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0', bg)}>
                      <Icon size={18} className="text-[#0f1012]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-[500] tracking-[-0.01em] text-[#0f1012]">{title}</span>
                      <span className="block truncate text-[13px] tracking-[-0.01em] text-[#0f1012]/50">{desc}</span>
                    </span>
                    <ArrowUpRight size={16} className="shrink-0 text-[#0f1012]/30" />
                  </a>
                </li>
              ))}
            </ul>

            <ul className="mt-8">
              {links.map(({ href, label }, i) => (
                <li key={href} className={reveal} style={revealDelay(i + 4)}>
                  <a
                    href={href}
                    onClick={close}
                    className="group flex items-center justify-between py-4 border-b border-[#0f1012]/8 font-serif text-[34px] leading-none tracking-[-0.02em] text-[#0f1012]"
                  >
                    {label}
                    <ArrowRight size={20} className="text-[#0f1012]/30 transition-transform group-active:translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className={cn('shrink-0 px-4 sm:px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] border-t border-[#0f1012]/6', reveal)}
            style={revealDelay(7)}
          >
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={close}
                className="h-12 flex items-center justify-center rounded-full border border-[#0f1012]/15 text-[15px] tracking-[-0.01em] text-[#0f1012]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="h-12 flex items-center justify-center rounded-full bg-[#0f1012] text-[15px] tracking-[-0.01em] text-[#faf9f5]"
              >
                Get Started
              </Link>
            </div>
            <p className="mt-3 text-center text-[12px] tracking-[-0.01em] text-[#0f1012]/40">No credit card · Results in under 90 seconds</p>
          </div>
        </div>
      </div>
    </>
  )
}
