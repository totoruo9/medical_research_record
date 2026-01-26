'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OCRUpload } from '@/components/ocr-upload'
import { updateBloodTest } from '@/lib/actions/blood-test'

// Fields configuration
type FieldConfig = {
    key: string
    label: string
    type: string
    required?: boolean
}

const FIELD_GROUPS: { title: string, fields: FieldConfig[] }[] = [
    {
        title: "기본 정보",
        fields: [
            { key: 'test_date', label: '검사 일자', type: 'date', required: true },
        ]
    },
    {
        title: "종양 표지자",
        fields: [
            { key: 'ca_19_9', label: 'CA 19-9 (0~35)', type: 'number' },
            { key: 'cea', label: 'CEA (0~5.0)', type: 'number' },
        ]
    },
    {
        title: "혈액 일반",
        fields: [
            { key: 'wbc_count', label: 'WBC (4.0~10.8)', type: 'number' },
            { key: 'rbc_count', label: 'RBC (3.6~6.1)', type: 'number' },
            { key: 'hemoglobin', label: 'Hemoglobin (13.0~17.4)', type: 'number' },
            { key: 'hct', label: 'Hct (40.0~52.0)', type: 'number' },
            { key: 'neutrophil', label: 'Neutrophil (1.7~7)', type: 'number' },
        ]
    },
    {
        title: "간/신장/췌장 수치",
        fields: [
            { key: 'amylase', label: 'Amylase (30~115)', type: 'number' },
            { key: 'lipase', label: 'Lipase (5.0~60.0)', type: 'number' },
            { key: 'ast', label: 'AST/GOT (13~34)', type: 'number' },
            { key: 'alt', label: 'ALT/GPT (5~46)', type: 'number' },
            { key: 'gamma_gt', label: 'Gamma-GT (12~54)', type: 'number' },
            { key: 't_bilirubin', label: 'T. Bilirubin (0.5~1.8)', type: 'number' },
            { key: 'alk_phos', label: 'Alk. Phos (50~151)', type: 'number' },
            { key: 'bun', label: 'BUN (8.5~22)', type: 'number' },
            { key: 'creatinine', label: 'Creatinine (0.68~1.19)', type: 'number' },
        ]
    },
    {
        title: "전해질 및 기타",
        fields: [
            { key: 'glucose', label: 'Glucose (70~110)', type: 'number' },
            { key: 'calcium', label: 'Calcium (8.5~10.5)', type: 'number' },
            { key: 'inorganic_p', label: 'Inorganic P (2.5~4.2)', type: 'number' },
            { key: 'uric_acid', label: 'Uric Acid (3.5~8.1)', type: 'number' },
            { key: 'total_cholesterol', label: 'Total. Chol (142~240)', type: 'number' },
            { key: 'total_protein', label: 'Total Protein (6.0~8.0)', type: 'number' },
            { key: 'albumin', label: 'Albumin (3.3~5.3)', type: 'number' },
            { key: 'na', label: 'Na (135~145)', type: 'number' },
            { key: 'k', label: 'K (3.5~5.5)', type: 'number' },
            { key: 'cl', label: 'Cl (98~110)', type: 'number' },
        ]
    }
]

interface BloodTestFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export function BloodTestForm({ initialData, onSuccess, onCancel }: BloodTestFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const supabase = createClient()
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data: any = {}

        formData.forEach((value, key) => {
            if (value && value !== '') {
                data[key] = key === 'test_date' ? value : parseFloat(value as string)
            }
        })

        try {
            if (initialData?.id) {
                // Update
                await updateBloodTest(initialData.id, data)
            } else {
                // Create
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    data.user_id = user.id
                }
                const { error } = await supabase.from('blood_tests').insert(data)
                if (error) throw error
            }

            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/blood-tests')
                router.refresh()
            }
        } catch (error: any) {
            alert('저장 실패: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <Label className="mb-2 block font-semibold text-gray-700">AI 자동 입력 (선택사항)</Label>
                <OCRUpload type="blood_test" onUploadComplete={(data) => {
                    Object.entries(data).forEach(([key, value]) => {
                        // For controlled inputs in parent, this might need a different approach,
                        // but sticking to DOM manipulation for now as per original code for simplicity.
                        // Ideally should be state driven.
                        const element = document.getElementsByName(key)[0] as HTMLInputElement
                        if (element) {
                            element.value = String(value)
                        }
                    })
                }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {FIELD_GROUPS.map((group) => (
                    <Card key={group.title}>
                        <CardHeader>
                            <CardTitle className="text-lg">{group.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.fields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label htmlFor={field.key}>{field.label}</Label>
                                    <Input
                                        id={field.key}
                                        name={field.key}
                                        type={field.type}
                                        required={field.required}
                                        step="0.01"
                                        defaultValue={initialData?.[field.key] || ''}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}

                <div className="h-24 md:hidden" />
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 md:static md:border-0 md:bg-transparent md:p-0 flex items-center justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
                    <Button type="button" variant="outline" onClick={onCancel || (() => router.back())} className="flex-1 md:flex-none">취소</Button>
                    <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        저장하기
                    </Button>
                </div>
            </form>
        </div>
    )
}
