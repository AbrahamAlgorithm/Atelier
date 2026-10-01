'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#0f1012]/20 border-t-[#8B6914] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
