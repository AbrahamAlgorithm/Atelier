'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { login } from '@/lib/api'
import { setTokens, setUser } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { APIError } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      setTokens(res.access_token, res.refresh_token)
      setUser(res.user)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      {/* Left — branding */}
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

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile back link */}
          <Link href="/" className="lg:hidden flex items-center gap-1.5 text-[13px] text-[#8f8f8f] hover:text-[#0f1012] transition-colors mb-8 -mt-4">
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <div className="mb-8">
            <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">Sign in</h1>
            <p className="text-[13px] text-[#8f8f8f] mt-1.5 tracking-[-0.02em]">
              New here?{' '}
              <Link href="/register" className="text-[#0071e3] hover:underline">
                Create an account
              </Link>
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
            <div>
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="flex justify-end mt-1.5">
                <Link href="/forgot-password" className="text-[12px] text-[#8f8f8f] hover:text-[#0071e3] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-[10px] border border-red-100">
                {error}
              </p>
            )}

            <Button type="submit" variant="secondary" size="lg" className="w-full mt-2" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
