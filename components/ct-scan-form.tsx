'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OCRUpload } from '@/components/ocr-upload'

interface CTScanFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export function CTScanForm({ initialData, onSuccess, onCancel }: CTScanFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const supabase = createClient()
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data: any = {
            scan_date: formData.get('scan_date'),
            cancer_size: formData.get('cancer_size'),
            interpretation: formData.get('interpretation'),
            doctor_opinion: formData.get('doctor_opinion'),
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from('ct_scans')
                    .update(data)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                // Create
                data.user_id = user.id
                const { error } = await supabase
                    .from('ct_scans')
                    .insert(data)
                if (error) throw error
            }

            if (onSuccess) {
                onSuccess()
            } else {
                router.refresh()
            }
        } catch (error: any) {
            alert('저장 실패: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <Label className="mb-2 block font-semibold text-gray-700">AI 자동 입력 (선택사항)</Label>
                <OCRUpload type="ct_scan" onUploadComplete={(data) => {
                    if (data.scan_date) {
                        const dateInput = document.getElementById('ct_scan_date') as HTMLInputElement
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="ct_scan_date">촬영 일자</Label>
                    <Input
                        id="ct_scan_date"
                        name="scan_date"
                        type="date"
                        required
                        defaultValue={initialData?.scan_date}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cancer_size">암 사이즈 (예: 2.5cm)</Label>
                    <Input
                        id="cancer_size"
                        name="cancer_size"
                        placeholder="2.5cm"
                        defaultValue={initialData?.cancer_size}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="interpretation">판독지 내용</Label>
                    <Textarea
                        id="interpretation"
                        name="interpretation"
                        className="min-h-[100px]"
                        placeholder="판독지에 적힌 주요 내용을 입력하세요."
                        defaultValue={initialData?.interpretation}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="doctor_opinion">담당의 소견</Label>
                    <Textarea
                        id="doctor_opinion"
                        name="doctor_opinion"
                        className="min-h-[80px]"
                        placeholder="의사 선생님이 말씀하신 내용을 기록하세요."
                        defaultValue={initialData?.doctor_opinion}
                    />
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1 md:flex-none">취소</Button>
                    <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        저장하기
                    </Button>
                </div>
            </form>
        </div>
    )
}
