'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { InktRecordForm } from '@/components/inkt-record-form'

export default function NewINKtPage() {
    const router = useRouter()

    const handleSuccess = () => {
        router.push('/inkt')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">iNKt 투여 기록 추가</h1>

                <Card>
                    <CardContent className="pt-6">
                        <InktRecordForm
                            onSuccess={handleSuccess}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
