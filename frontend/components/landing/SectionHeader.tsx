import { cn } from '@/lib/cn'

interface SectionHeaderProps {
  eyebrow: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: 'center' | 'left'
  dark?: boolean
  className?: string
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'center', dark = false, className }: SectionHeaderProps) {
  return (
    <div className={cn('reveal max-w-[720px]', align === 'center' && 'mx-auto text-center', className)}>
      <p
        className={cn(
          'inline-flex items-center gap-2 text-[12px] font-[500] uppercase tracking-[0.14em]',
          dark ? 'text-[#faf9f5]/50' : 'text-[#0f1012]/45'
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#C4A882]" />
        {eyebrow}
      </p>
      {/* `!` — the unlayered h1–h6 rule in globals.css otherwise wins over utilities */}
      <h2
        className={cn(
          'mt-4 font-serif font-[400]! text-[clamp(34px,4.6vw,56px)] leading-[1.06]! text-balance',
          dark ? 'text-[#faf9f5]' : 'text-[#0f1012]'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-[16px] sm:text-[18px] leading-[1.55] tracking-[-0.015em] text-balance',
            dark ? 'text-[#faf9f5]/60' : 'text-[#0f1012]/60'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
