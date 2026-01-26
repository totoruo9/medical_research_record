'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateInktRecord } from '@/lib/actions/inkt'

interface InktRecordFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel?: () => void
}

export function InktRecordForm({ initialData, onSuccess, onCancel }: InktRecordFormProps) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const supabase = createClient()
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const data: any = {
                blood_collection_date: formData.get('blood_collection_date'),
                first_admin_date: formData.get('first_admin_date') || null,
                second_admin_date: formData.get('second_admin_date') || null,
                notes: formData.get('notes') || null,
                treatment_effect: formData.get('treatment_effect') || null
            }

            if (initialData?.id) {
                await updateInktRecord(initialData.id, data)
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) data.user_id = user.id
                const { error } = await supabase.from('inkt_records').insert(data)
                if (error) throw error
            }
            onSuccess()
        } catch (error: any) {
            alert('저장 실패: ' + error.message)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="blood_collection_date">채혈 일자 (필수)</Label>
                <Input
                    id="blood_collection_date"
                    name="blood_collection_date"
                    type="date"
                    required
                    defaultValue={initialData?.blood_collection_date}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="first_admin_date">1회차 투여일</Label>
                <Input
                    id="first_admin_date"
                    name="first_admin_date"
                    type="date"
                    defaultValue={initialData?.first_admin_date}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="second_admin_date">2회차 투여일</Label>
                <Input
                    id="second_admin_date"
                    name="second_admin_date"
                    type="date"
                    defaultValue={initialData?.second_admin_date}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">특이사항 (예: 발열, 오한 등)</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="투여 후 특이사항이 있다면 기록해주세요."
                    defaultValue={initialData?.notes}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="treatment_effect">치료 효능/효과 (주관적 느낌 등)</Label>
                <Textarea
                    id="treatment_effect"
                    name="treatment_effect"
                    placeholder="투여 후 컨디션 변화나 통증 감소 등 긍정적인 변화를 기록해주세요."
                    defaultValue={initialData?.treatment_effect}
                />
            </div>

            <div className="flex gap-4 justify-end pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        취소
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    저장하기
                </Button>
            </div>
        </form>
    )
}
