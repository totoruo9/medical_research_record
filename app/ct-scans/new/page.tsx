
'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea' // Need to verify if textarea exists or use Input
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OCRUpload } from '@/components/ocr-upload'

// I assume Textarea component is not installed, so I'll standard textarea with shadcn classes
// or just use Input for multiline if needed, but standard textarea is better.
// Actually standard <textarea> with tailwind classes (border, rounded, p-2) is fine.

export default function NewCTScanPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data: any = {
            scan_date: formData.get('scan_date'),
            cancer_size: formData.get('cancer_size'),
            interpretation: formData.get('interpretation'),
            doctor_opinion: formData.get('doctor_opinion'),
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) data.user_id = user.id

        const { error } = await supabase.from('ct_scans').insert(data)

        if (error) {
            alert('저장 실패: ' + error.message)
            setLoading(false)
        } else {
            router.push('/ct-scans')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">CT 결과 기록 추가</h1>

                <div className="mb-8">
                    <Label className="mb-2 block font-semibold text-gray-700">AI 자동 입력 (선택사항)</Label>
                    <OCRUpload type="ct_scan" onUploadComplete={(data) => {
                        if (data.scan_date) {
                            const dateInput = document.getElementById('scan_date') as HTMLInputElement
                            if (dateInput) dateInput.value = data.scan_date
                        }
                        if (data.cancer_size) {
                            const sizeInput = document.getElementById('cancer_size') as HTMLInputElement
                            if (sizeInput) sizeInput.value = data.cancer_size
                        }
                        if (data.finding) {
                            const interpretationInput = document.getElementById('interpretation') as HTMLTextAreaElement
                            if (interpretationInput) interpretationInput.value = data.finding
                        }
                        if (data.impression) {
                            const opinionInput = document.getElementById('doctor_opinion') as HTMLTextAreaElement
                            if (opinionInput) opinionInput.value = data.impression
                        }
                    }} />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="scan_date">촬영 일자</Label>
                                <Input id="scan_date" name="scan_date" type="date" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cancer_size">암 사이즈 (예: 2.5cm)</Label>
                                <Input id="cancer_size" name="cancer_size" placeholder="2.5cm" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interpretation">판독지 내용</Label>
                                <textarea
                                    id="interpretation"
                                    name="interpretation"
                                    className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="판독지에 적힌 주요 내용을 입력하세요."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="doctor_opinion">담당의 소견</Label>
                                <textarea
                                    id="doctor_opinion"
                                    name="doctor_opinion"
                                    className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="의사 선생님이 말씀하신 내용을 기록하세요."
                                />
                            </div>

                            <div className="flex gap-4 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    저장하기
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
