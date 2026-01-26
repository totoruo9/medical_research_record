import { BloodTestForm } from '@/components/blood-test-form'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewBloodTestPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            <div className="sticky top-0 z-[60] bg-gray-50/95 backdrop-blur border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 h-14 flex items-center mb-6 transition-all">
                <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
                    <Link href="/blood-tests">
                        <Button variant="ghost" size="icon" className="-ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200/50">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">새 혈액 검사 기록 추가</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <BloodTestForm />
            </div>
        </div>
    )
}
