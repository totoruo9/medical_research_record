'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, FileText, Scan, Syringe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Mock Data (Moved here)
const data = [
    { date: '2023-08', ca199: 85, cea: 6.2, event: '진단', details: { ct: '췌장 꼬리 3.2cm 종괴 발견', report: '초기 진단 리포트' } },
    { date: '2023-09', ca199: 72, cea: 5.8, event: 'iNKt 1차', details: { inkt: '1차 투여 완료', blood: '수치 소폭 감소' } },
    { date: '2023-10', ca199: 45, cea: 3.2, event: 'CT', details: { ct: '종괴 2.5cm로 축소', report: '치료 반응 긍정적' } },
    { date: '2023-11', ca199: 42, cea: 3.0, event: null, details: { blood: '안정세 유지' } },
    { date: '2023-12', ca199: 38, cea: 2.8, event: 'iNKt 2차', details: { inkt: '2차 투여 완료', report: '면역 수치 개선' } },
    { date: '2024-01', ca199: 45, cea: 4.1, event: 'Warning', details: { blood: 'CA19-9 소폭 반등', ct: '크기 변화 없음 (2.5cm)' } },
]

export function Option6Chart() {
    const [selectedPoint, setSelectedPoint] = useState<any>(data[data.length - 1])

    const handleChartClick = (state: any) => {
        if (state && state.activePayload) {
            setSelectedPoint(state.activePayload[0].payload)
        }
    }

    return (
        <div className="space-y-6">
            {/* Main Interactive Chart */}
            <Card className="shadow-md border-indigo-100">
                <CardHeader>
                    <CardTitle>종양표지자 추이 (Click Points)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Line yAxisId="left" type="monotone" dataKey="ca199" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} name="CA 19-9" />
                            <Line yAxisId="right" type="monotone" dataKey="cea" stroke="#3b82f6" strokeWidth={3} name="CEA" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Detail Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 key={selectedPoint.date}">

                {/* Date & Event Summary */}
                <Card className="bg-indigo-600 text-white md:col-span-1">
                    <CardContent className="flex flex-col justify-center h-full p-6 text-center">
                        <h2 className="text-3xl font-bold mb-2">{selectedPoint.date}</h2>
                        {selectedPoint.event && (
                            <Badge variant="secondary" className="self-center bg-white/20 text-white border-none text-lg py-1 px-4">
                                {selectedPoint.event}
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed Records */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">해당 기간 상세 기록</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedPoint.details.blood && (
                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                <Activity className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900">혈액 검사</p>
                                    <p className="text-gray-600 text-sm">CA19-9: {selectedPoint.ca199}, CEA: {selectedPoint.cea}</p>
                                    <p className="text-gray-500 text-xs mt-1">{selectedPoint.details.blood}</p>
                                </div>
                            </div>
                        )}

                        {selectedPoint.details.ct && (
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <Scan className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900">CT 촬영</p>
                                    <p className="text-gray-600 text-sm">{selectedPoint.details.ct}</p>
                                </div>
                            </div>
                        )}

                        {selectedPoint.details.inkt && (
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <Syringe className="w-5 h-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900">iNKt 면역 치료</p>
                                    <p className="text-gray-600 text-sm">{selectedPoint.details.inkt}</p>
                                </div>
                            </div>
                        )}

                        {selectedPoint.details.report && (
                            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900">AI 분석 리포트</p>
                                    <p className="text-gray-600 text-sm">{selectedPoint.details.report}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
