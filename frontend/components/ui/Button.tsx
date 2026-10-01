import { cn } from '@/lib/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-[400] tracking-[-0.02em] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-[0.98]',
        secondary: 'bg-[#0f1012] text-[#faf9f5] hover:bg-[#1a1c1f] active:scale-[0.98]',
        ghost: 'bg-transparent text-[#0f1012] hover:bg-black/5 active:scale-[0.98]',
        outline: 'border border-[#0f1012]/20 text-[#0f1012] bg-transparent hover:bg-black/5 active:scale-[0.98]',
        brown: 'bg-[#8B6914] text-white hover:bg-[#7a5c11] active:scale-[0.98]',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-4 text-[12px] rounded-[10px]',
        md: 'h-10 px-6 text-[13px] rounded-[10px]',
        lg: 'h-12 px-8 text-[14px] rounded-[10px]',
        pill: 'h-9 px-6 text-[13px] rounded-[26px]',
        icon: 'h-8 w-8 rounded-[10px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
