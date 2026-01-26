
'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ImportPage() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleImport = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session || !session.provider_token) {
                throw new Error('Google 계정으로 다시 로그인해주세요. (권한 만료)')
            }

            // Extract Sheet ID
            const spreadsheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
            if (!spreadsheetIdMatch) {
                throw new Error('올바른 구글 시트 URL이 아닙니다.')
            }
            const spreadsheetId = spreadsheetIdMatch[1]

            // Fetch Data
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z100`, {
                headers: {
                    Authorization: `Bearer ${session.provider_token}`
                }
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error?.message || '시트를 불러오는데 실패했습니다.')
            }

            const data = await response.json()
            const rows = data.values
            if (!rows || rows.length < 2) {
                throw new Error('시트에 데이터가 충분하지 않습니다.')
            }

            const insertResponse = await fetch('/api/blood-tests/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows })
            })

            if (!insertResponse.ok) {
                throw new Error('데이터 저장에 실패했습니다.')
            }

            setSuccess('성공적으로 데이터를 가져왔습니다!')
            setTimeout(() => router.push('/blood-tests'), 2000)

        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            {/* Sticky Header */}
            <div className="sticky top-0 z-[60] bg-gray-50/95 backdrop-blur border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 h-14 flex items-center mb-6 transition-all">
                <div className="max-w-lg mx-auto w-full flex items-center gap-3">
                    <Link href="/blood-tests">
                        <Button variant="ghost" size="icon" className="-ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200/50">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">구글 시트에서 가져오기</h1>
                </div>
            </div>

            <div className="px-4 pb-20">
                <Card className="w-full max-w-lg mx-auto shadow-sm">
                    <CardHeader>
                        <CardDescription>
                            혈액 검사 데이터가 있는 구글 시트의 전체 URL을 입력하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> {success}
                            </div>
                        )}

                        <Button onClick={handleImport} disabled={loading || !url} className="w-full">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? '가져오는 중...' : '데이터 가져오기'}
                        </Button>

                        <div className="text-xs text-gray-400 text-center">
                            * 시트의 첫 번째 행은 항목 이름(예: Calcium, Glucose 등)이어야 합니다.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
