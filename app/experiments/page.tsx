import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export default function ExperimentsPage() {
    const experiments = [
        {
            id: 'option3',
            title: 'Option 3: 전체 의료기록 보기 (Unified View)',
            description: '모든 의료 기록(혈액, CT, 리포트)을 하나의 페이지에서 탭이나 리스트로 통합하여 보여줍니다.',
            href: '/experiments/option3'
        },
        {
            id: 'option4',
            title: 'Option 4: 타임라인 뷰 (Timeline Status)',
            description: '소셜 미디어 피드처럼 시간 순서대로 모든 의료 이벤트와 상태 변화를 흐름으로 보여줍니다.',
            href: '/experiments/option4'
        },
        {
            id: 'option5',
            title: 'Option 5: 문맥 기반 토글 (Contextual Accordion)',
            description: '분석 리포트 상세 화면에서 당시의 의료 데이터를 접고 펼칠 수 있는 UI를 테스트합니다.',
            href: '/experiments/option5'
        },
        {
            id: 'option6',
            title: 'Option 6: 그래프 탐색기 (Chart Explorer)',
            description: '메인이 되는 그래프 위에서 특정 시점을 클릭하여 세부 데이터를 탐색하는 인터랙티브 UI입니다.',
            href: '/experiments/option6'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">UI/UX 실험실</h1>
                    <p className="text-gray-500">다양한 의료 기록 열람 방식을 테스트하고 비교해보세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {experiments.map((exp) => (
                        <Link key={exp.id} href={exp.href}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{exp.title}</CardTitle>
                                        <ArrowRight className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <CardDescription className="pt-2">
                                        {exp.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
