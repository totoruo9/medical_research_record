'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    const supabase = createClient()
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'email profile',
      },
    })
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo_wide.png"
            alt="이음 (I-Eum)"
            width={220}
            height={70}
            className="object-contain h-auto"
            priority
          />
        </div>
        <p className="text-sm text-gray-500">
          의무 기록을 안전하게 관리하고 AI 기반 정밀 분석을 시작하세요.
        </p>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : null}
          Google 계정으로 계속하기
        </Button>

        <div className="pt-4 text-xs text-center text-gray-400 relative z-10">
          계속 진행함으로써 귀하는 서비스의 정책에 동의하게 됩니다.
        </div>
      </div>

      <footer className="absolute bottom-6 w-full text-center">
        <div className="space-x-6 text-sm text-gray-500">
          <Link href="https://ieum-ai.com/terms" className="hover:text-gray-900 underline transition-colors">이용약관</Link>
          <Link href="https://ieum-ai.com/privacy" className="hover:text-gray-900 underline transition-colors">개인정보처리방침</Link>
        </div>
        <p className="mt-2 text-xs text-gray-400">© {new Date().getFullYear()} I-Eum. All rights reserved.</p>
      </footer>
    </div>
  )
}
