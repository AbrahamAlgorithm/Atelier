'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { register } from '@/lib/api'
import { setTokens, setUser } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { APIError } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(email, password, name)
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
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f1012] flex-col justify-between p-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[18px] font-[350] tracking-[-0.36px] text-[#faf9f5]">Atelier</span>
          <span className="text-[10px] text-[#C4A882] font-[400] bg-[#8B6914]/30 px-1.5 py-0.5 rounded-full">AI</span>
        </Link>
        <div>
          <p className="text-[27px] font-[350] tracking-[-0.54px] leading-[1.2] text-[#faf9f5] mb-6">
            Design smarter.<br />Create faster.
          </p>
          <div className="space-y-3">
            {['Ghost mannequin in seconds', 'Auto-generate sewing patterns', 'Virtual try-on for any outfit'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <span className="w-1 h-1 rounded-full bg-[#8B6914]" />
                <p className="text-[13px] text-[#8f8f8f] tracking-[-0.02em]">{f}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-[#8f8f8f]/50">© 2025 Atelier AI</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile back link */}
          <Link href="/" className="lg:hidden flex items-center gap-1.5 text-[13px] text-[#8f8f8f] hover:text-[#0f1012] transition-colors mb-8 -mt-4">
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <div className="mb-8">
            <h1 className="text-[27px] font-[350] tracking-[-0.54px] text-[#0f1012]">Create account</h1>
            <p className="text-[13px] text-[#8f8f8f] mt-1.5 tracking-[-0.02em]">
              Already have one?{' '}
              <Link href="/login" className="text-[#0071e3] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" required />
            <Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />

            {error && (
              <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-[10px] border border-red-100">{error}</p>
            )}

            <Button type="submit" variant="secondary" size="lg" className="w-full mt-2" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="text-[10px] text-[#8f8f8f] mt-4 text-center leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
