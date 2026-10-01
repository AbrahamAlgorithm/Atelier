'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { forgotPassword } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f1012] flex-col justify-between p-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[18px] font-[350] tracking-[-0.36px] text-[#faf9f5]">Atelier</span>
          <span className="text-[10px] tracking-[-0.1px] text-[#C4A882] font-[400] bg-[#8B6914]/30 px-1.5 py-0.5 rounded-full">AI</span>
        </Link>
        <div>
          <p className="text-[27px] font-[350] tracking-[-0.54px] leading-[1.2] text-[#faf9f5] mb-6">
            Where Fashion<br />Meets AI.
          </p>
          <p className="text-[14px] font-[400] text-[#8f8f8f] tracking-[-0.02em] leading-relaxed">
            Ghost mannequins, pattern generation, and virtual try-on — all in one place.
          </p>
        </div>
        <p className="text-[11px] text-[#8f8f8f]/50 tracking-[-0.01em]">© 2025 Atelier AI</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/login" className="flex items-center gap-1.5 text-[13px] text-[#8f8f8f] hover:text-[#0f1012] transition-colors mb-8 -mt-4">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>

          {submitted ? (
            <div>
              <div className="mb-6">
                <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">Check your email</h1>
                <p className="text-[13px] text-[#8f8f8f] mt-2 tracking-[-0.02em] leading-relaxed">
                  If an account exists for <span className="text-[#0f1012]">{email}</span>, we sent a password reset link. Check your inbox and spam folder.
                </p>
              </div>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">Forgot password?</h1>
                <p className="text-[13px] text-[#8f8f8f] mt-1.5 tracking-[-0.02em]">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />

                {error && (
                  <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-[10px] border border-red-100">
                    {error}
                  </p>
                )}

                <Button type="submit" variant="secondary" size="lg" className="w-full mt-2" loading={loading}>
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
