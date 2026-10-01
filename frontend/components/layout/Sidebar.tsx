'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import { clearTokens, getRefreshToken } from '@/lib/auth'
import { logout } from '@/lib/api'
import { Ghost, Scissors, UserCircle2, LayoutDashboard, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ghost-mannequin', label: 'Ghost Mannequin', icon: Ghost },
  { href: '/pattern-generator', label: 'Pattern Generator', icon: Scissors },
  { href: '/virtual-tryon', label: 'Virtual Try-On', icon: UserCircle2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const refreshToken = getRefreshToken()
    if (refreshToken) await logout(refreshToken).catch(() => {})
    clearTokens()
    router.push('/login')
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 h-screen sticky top-0 border-r border-[#0f1012]/8 bg-[#faf9f5] flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#0f1012]/8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-[18px] font-[350] tracking-[-0.36px] text-[#0f1012]">Atelier</span>
            <span className="text-[10px] tracking-[-0.1px] text-[#8B6914] font-[400] bg-[#e8ddd0] px-1.5 py-0.5 rounded-full">AI</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-[400] tracking-[-0.02em] transition-colors duration-100',
                isActive(href)
                  ? 'bg-[#0f1012] text-[#faf9f5]'
                  : 'text-[#0f1012]/60 hover:bg-[#0f1012]/5 hover:text-[#0f1012]'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#0f1012]/8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[13px] font-[400] tracking-[-0.02em] text-[#0f1012]/50 hover:bg-[#0f1012]/5 hover:text-[#0f1012] transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#0f1012]/8 flex items-center justify-between px-4 h-13">
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <span className="text-[16px] font-[350] tracking-[-0.32px] text-[#0f1012]">Atelier</span>
          <span className="text-[9px] text-[#8B6914] font-[400] bg-[#e8ddd0] px-1.5 py-0.5 rounded-full">AI</span>
        </Link>
        <button
          onClick={handleLogout}
          className="p-2 text-[#0f1012]/40 hover:text-[#0f1012] transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf9f5]/95 backdrop-blur-md border-t border-[#0f1012]/8 flex items-stretch pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-[400] tracking-[-0.01em] transition-colors',
              isActive(href)
                ? 'text-[#0f1012]'
                : 'text-[#0f1012]/40 hover:text-[#0f1012]'
            )}
          >
            <Icon size={18} strokeWidth={isActive(href) ? 2 : 1.5} />
            <span className="leading-none">{label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
