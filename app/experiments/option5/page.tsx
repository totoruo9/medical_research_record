import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge'
import { Activity, Scan, Syringe, FileText, ChevronRight } from 'lucide-react'

export default function Option5Page() {
    // Mock Data for "Context"
    const mockContext = {
        blood: {
            date: '2024-01-20',
            values: { ca_19_9: 45.2, cea: 4.1, wbc: 5.4, neutrophil: 65 }
        },
        ct: {
            date: '2024-01-22',
            cancer_size: '2.3cm',
            impression: '췌장 두부에 국한된 저음영 종괴. 혈관 침범 소견 없음.'
        },
        inkt: {
            date: '2024-01-15',
            status: '투여 완료 (1회차)',
            memo: '특이 부작용 없음'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />
            <div className="max-w-4xl mx-auto p-4 py-10 space-y-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Option 5: 문맥 기반 토글</h1>
                    <p className="text-gray-500">리포트 상단에서 당시의 의료 데이터를 펼쳐볼 수 있습니다.</p>
                </div>

                <div className="space-y-6">
                    {/* Report Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <FileText className="w-5 h-5" />
                            <span className="font-semibold">AI 정밀 분석 리포트</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">2024년 1월 25일 종합 분석</h2>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">상태 호전</Badge>
                            <span className="text-sm text-gray-500">생성일: 2024.01.25</span>
                        </div>
                    </div>

                    {/* Context Accordion - THE KEY FEATURE */}
                    <Accordion type="single" collapsible className="bg-white rounded-xl shadow-sm border px-6">
                        <AccordionItem value="context" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 w-full">
                                    <Badge variant="outline" className="bg-gray-50 text-gray-600">참고 데이터</Badge>
                                    <span className="text-sm font-medium text-gray-700">분석에 사용된 의료 기록 (2024.01.15 ~ 01.24)</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Blood Card */}
                                    <div className="border rounded-lg p-3 bg-red-50/30 border-red-100">
                                        <div className="flex items-center gap-2 mb-2 text-red-600 font-semibold text-sm">
                                            <Activity className="w-4 h-4" /> 혈액 검사 ({mockContext.blood.date})
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">CA 19-9</span>
                                                <span className="font-medium text-red-600">{mockContext.blood.values.ca_19_9} ▲</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">CEA</span>
                                                <span className="font-medium">{mockContext.blood.values.cea}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CT Card */}
                                    <div className="border rounded-lg p-3 bg-blue-50/30 border-blue-100">
                                        <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold text-sm">
                                            <Scan className="w-4 h-4" /> CT 촬영 ({mockContext.ct.date})
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium">암 크기: {mockContext.ct.cancer_size}</p>
                                            <p className="text-xs text-gray-500 line-clamp-2">{mockContext.ct.impression}</p>
                                        </div>
                                    </div>

                                    {/* iNKt Card */}
                                    <div className="border rounded-lg p-3 bg-green-50/30 border-green-100">
                                        <div className="flex items-center gap-2 mb-2 text-green-600 font-semibold text-sm">
                                            <Syringe className="w-4 h-4" /> iNKt 치료 ({mockContext.inkt.date})
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium">{mockContext.inkt.status}</p>
                                            <p className="text-xs text-gray-500">{mockContext.inkt.memo}</p>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Mock Report Content */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                        <div className="prose max-w-none text-gray-700">
                            <h3>1. 종합 소견</h3>
                            <p>
                                지난 검사 대비 종양표지자(CA19-9) 수치가 소폭 상승했으나, CT상 종양의 물리적 크기 변화는 관찰되지 않았습니다.
                                이는 종양의 활동성이 일부 존재할 수 있음을 시사하나, iNKt 치료의 효과로 인해 급격한 진행은 억제되고 있는 것으로 판단됩니다.
                            </p>

                            <h3>2. 주요 변화</h3>
                            <ul>
                                <li><strong>종양표지자:</strong> CA19-9 수치가 35에서 45.2로 상승했습니다. 추적 관찰이 필요합니다.</li>
                                <li><strong>영상 진단:</strong> 2.3cm 크기 유지. 신규 전이 소견 없음.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
