
'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
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
                scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly email profile',
            },
        })
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    췌장암 환자 케어 플랫폼
                </h2>
                <p className="text-sm text-gray-500">
                    건강 기록을 관리하고 AI 분석을 받기 위해 로그인해주세요.
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
                    계속 진행함으로써 귀하는 <Link href="/terms" className="hover:text-gray-600 underline cursor-pointer">이용약관</Link> 및 <Link href="/privacy" className="hover:text-gray-600 underline cursor-pointer">개인정보처리방침</Link>에 동의하게 됩니다.
                </div>
            </div>
        </div>
    )
}
