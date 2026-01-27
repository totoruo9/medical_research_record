import { SiteHeader } from '@/components/site-header'
import { Option6Chart } from '@/components/experiments/option6-chart'

export default function Option6Page() {
    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />
            <div className="max-w-5xl mx-auto p-4 py-10 space-y-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Option 6: 그래프 탐색기</h1>
                    <p className="text-gray-500">흐름을 보면서 특정 시점의 상세 정보를 탐색합니다.</p>
                </div>

                <Option6Chart />
            </div>
        </div>
    )
}
