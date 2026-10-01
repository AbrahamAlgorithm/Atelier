import { cn } from '@/lib/cn'

// Placeholder wordmarks (invented names) — replace with real customer logos, or remove, before launch.
const studios = [
  { name: 'Maison Aurel', className: 'font-serif uppercase tracking-[0.22em] text-[15px] font-[500]' },
  { name: 'ostrova', className: 'font-[800] text-[24px] tracking-[-0.05em]' },
  { name: 'Bias & Bloom', className: 'font-serif font-[300] text-[25px] tracking-[-0.02em]' },
  { name: 'KAIRA', className: 'font-[900] text-[20px] tracking-[0.16em]' },
  { name: 'Sølve Studio', className: 'font-[300] text-[22px] tracking-[-0.03em]' },
  { name: 'Petite Fève', className: 'font-serif font-[600] text-[23px] tracking-[-0.02em]' },
  { name: 'LUMEN/ROW', className: 'font-mono text-[15px] tracking-[0.1em]' },
  { name: 'HARTWELL', className: 'font-serif font-[700] text-[19px] tracking-[0.02em]' },
  { name: 'NOVA LINE', className: 'font-[700] text-[16px] tracking-[0.32em]' },
]

export function LogoMarquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]',
        className
      )}
    >
      <div className="marquee-track flex w-max items-center">
        {[0, 1].map(copy => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-14 pr-14 sm:gap-20 sm:pr-20 leading-none">
            {studios.map(({ name, className: wordmark }) => (
              <li key={name} className={cn('whitespace-nowrap text-[#0f1012]/45', wordmark)}>
                {name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
