'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Copy, Check, RefreshCw } from 'lucide-react'
import { createInviteCode } from '@/lib/actions/patient'

export function InviteManager({ user }: { user: any }) {
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    // Load initial code? Maybe better to load on click to save reads?
    // Or users want to see it.
    // Let's add a "Show Code" button.

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const code = await createInviteCode()
            setInviteCode(code)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (!inviteCode) return
        navigator.clipboard.writeText(inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="shadow-sm border-indigo-100 bg-indigo-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-indigo-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    가족(보호자) 초대하기
                </CardTitle>
                <CardDescription className="text-xs text-indigo-700/80">
                    초대 코드를 공유하여 가족과 의료 기록을 함께 관리하세요.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!inviteCode ? (
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading ? <RefreshCw className="animate-spin w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                        초대 코드 생성/확인
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-white border-2 border-indigo-200 text-indigo-800 text-xl font-bold tracking-widest px-4 py-2 rounded-md flex-1 text-center">
                                {inviteCode}
                            </div>
                            <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-[11px] text-gray-500 text-center">
                            이 코드를 가족에게 전달하세요. <br />
                            가입 시 '보호자'를 선택하여 입력하면 즉시 연결됩니다.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
