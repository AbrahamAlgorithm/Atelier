// Same lettermark as app/icon.svg, as a component so it can scale with its container.
export function AtelierMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="7" fill="#0f1012" />
      <path d="M16 7L5 26M16 7L27 26M9.5 18.5H22.5" stroke="#faf9f5" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="9" r="2.2" fill="#8B6914" />
    </svg>
  )
}
