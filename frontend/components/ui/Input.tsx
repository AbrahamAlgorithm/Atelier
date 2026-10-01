'use client'

import { cn } from '@/lib/cn'
import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const isPassword = type === 'password'
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[13px] font-[400] tracking-[-0.02em] text-[#0f1012]/70">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'h-11 w-full rounded-[10px] border border-[#0f1012]/15 bg-white px-4',
              'text-[16px] font-[400] tracking-[-0.02em] text-[#0f1012]',
              'placeholder:text-[#8f8f8f]',
              'focus:outline-none focus:ring-2 focus:ring-[#0f1012]/20 focus:border-[#0f1012]/40',
              'transition-colors duration-150',
              isPassword && 'pr-11',
              error && 'border-red-400 focus:ring-red-200',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-[#0f1012] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <p className="text-[11px] text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
