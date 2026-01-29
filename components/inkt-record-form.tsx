'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface InktRecordFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export function InktRecordForm({ initialData, onSuccess, onCancel }: InktRecordFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const supabase = createClient()
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data: any = {
            blood_collection_date: formData.get('blood_collection_date'),
            first_admin_date: formData.get('first_admin_date') || null,
            second_admin_date: formData.get('second_admin_date') || null,
            notes: formData.get('notes'),
            treatment_effect: formData.get('treatment_effect'),
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from('inkt_records')
                    .update(data)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                // Create
                data.user_id = user.id
                const { error } = await supabase
                    .from('inkt_records')
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
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="blood_collection_date">채혈일 (Blood Collection)</Label>
                    <Input
                        id="blood_collection_date"
                        name="blood_collection_date"
                        type="date"
                        required
                        defaultValue={initialData?.blood_collection_date}
                    />
                    <p className="text-xs text-muted-foreground">세포 배양을 위해 혈액을 채취한 날짜를 입력하세요.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="first_admin_date">1차 투약일 (1st Administration)</Label>
                    <Input
                        id="first_admin_date"
                        name="first_admin_date"
                        type="date"
                        defaultValue={initialData?.first_admin_date}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="second_admin_date">2차 투약일 (2nd Administration)</Label>
                    <Input
                        id="second_admin_date"
                        name="second_admin_date"
                        type="date"
                        defaultValue={initialData?.second_admin_date}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">특이사항 (부작용, 발열 등)</Label>
                    <div className="relative">
                        <textarea
                            id="notes"
                            name="notes"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="예: 1차 투여 당시 발열, 2차 투여 당시 오한"
                            defaultValue={initialData?.notes}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="treatment_effect">치료 효과</Label>
                    <div className="relative">
                        <textarea
                            id="treatment_effect"
                            name="treatment_effect"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="예: 암 크기 0.8mm 감소, 통증 완화"
                            defaultValue={initialData?.treatment_effect}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 md:flex-none">취소</Button>
                <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    저장하기
                </Button>
            </div>
        </form>
    )
}
