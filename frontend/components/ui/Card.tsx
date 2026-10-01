import { cn } from '@/lib/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered'
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[10px]',
        variant === 'default' && 'bg-white border border-[#0f1012]/8',
        variant === 'elevated' && 'bg-white shadow-sm shadow-black/5',
        variant === 'bordered' && 'bg-[#faf9f5] border border-[#e8ddd0]',
        className
      )}
      {...props}
    />
  )
}
