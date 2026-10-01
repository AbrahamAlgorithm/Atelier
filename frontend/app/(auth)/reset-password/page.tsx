'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { resetPassword, APIError } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new link.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div>
        <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012] mb-2">Password updated</h1>
        <p className="text-[13px] text-[#8f8f8f] tracking-[-0.02em]">Redirecting you to sign in…</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">Set new password</h1>
        <p className="text-[13px] text-[#8f8f8f] mt-1.5 tracking-[-0.02em]">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password"
          label="New password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Input
          id="confirm"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-[10px] border border-red-100">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full mt-2"
          loading={loading}
          disabled={!token}
        >
          Update password
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
