'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Loader2, Brain, FileText, Activity, Download, ChevronRight, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ReportItem } from '@/components/report-item'

export default function DashboardClient({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [recentTest, setRecentTest] = useState<any>(null)
    const [recentCt, setRecentCt] = useState<any>(null)
    const [recentInkt, setRecentInkt] = useState<any>(null) // State for iNKt record
    const [showResultModal, setShowResultModal] = useState(false)
    const [newReport, setNewReport] = useState<any>(null)
    const [recentReport, setRecentReport] = useState<any>(null) // For the dashboard summary card

    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()
        const { data: reports } = await supabase.from('ai_reports').select('*').order('created_at', { ascending: false }).limit(1)
        if (reports && reports.length > 0) setRecentReport(reports[0])

        const { data: tests } = await supabase.from('blood_tests').select('*').order('test_date', { ascending: false }).limit(1)
        if (tests && tests.length > 0) setRecentTest(tests[0])

        const { data: cts } = await supabase.from('ct_scans').select('*').order('scan_date', { ascending: false }).limit(1)
        if (cts && cts.length > 0) setRecentCt(cts[0])

        // Fetch iNKt records
        const { data: inkts } = await supabase.from('inkt_records').select('*').order('blood_collection_date', { ascending: false }).limit(1)
        if (inkts && inkts.length > 0) setRecentInkt(inkts[0])
    }

    const handleAnalyze = async () => {
        const supabase = createClient()
        setLoading(true)
        try {
            const res = await fetch('/api/analyze', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Fetch the newly created report (it was just inserted)
            // Ideally the API returns the full report object, but if it returns just content, we might need to fetch the latest
            const { data: latestReport } = await supabase
                .from('ai_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (latestReport) {
                setNewReport(latestReport)
                setShowResultModal(true)
                await fetchData() // Refresh dashboard state
            }
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">환자 대시보드</h2>
                    <p className="text-gray-500">오늘의 건강 상태를 한눈에 확인하세요.</p>
                </div>
                {recentTest || recentCt ? (
                    <div className="flex gap-2">
                        <Button onClick={handleAnalyze} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:shadow-lg">
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Brain className="mr-2 h-4 w-4" />}
                            {loading ? 'AI 분석 중...' : '맞춤형 정밀 분석 실행'}
                        </Button>
                    </div>
                ) : (
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:shadow-lg">
                        <Link href="/blood-tests">
                            <Activity className="mr-2 h-4 w-4" /> 초기 데이터 입력하기
                        </Link>
                    </Button>
                )}
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ... (Existing Metric Cards Code) ... */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> 최근 혈액 검사
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTest ? (
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-gray-900">
                                    {format(new Date(recentTest.test_date), 'yyyy.MM.dd')}
                                </div>
                                <div className="flex gap-4 text-sm text-gray-600 pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase">CA 19-9</span>
                                        <span className="font-semibold">{recentTest.ca_19_9 || '-'}</span>
                                    </div>
                                    <div className="w-px bg-gray-200"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase">CEA</span>
                                        <span className="font-semibold">{recentTest.cea || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-sm">
                                <Activity className="h-8 w-8 mb-2 opacity-20" />
                                기록 없음
                            </div>
                        )}
                    </CardContent>
                    {recentTest && (
                        <CardFooter className="pt-0">
                            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-800" asChild>
                                <a href="/blood-tests">자세히 보기 <ChevronRight className="w-4 h-4 ml-1" /></a>
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-teal-500">
                    {/* ... CT Scan Card Content ... */}
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> 최근 CT 판독
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentCt ? (
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-gray-900">
                                    {format(new Date(recentCt.scan_date), 'yyyy.MM.dd')}
                                </div>
                                <div className="text-sm text-gray-600 pt-2 line-clamp-2">
                                    {recentCt.finding || '판독 내용 없음'}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-sm">
                                <FileText className="h-8 w-8 mb-2 opacity-20" />
                                기록 없음
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" className="w-full text-teal-600 hover:text-teal-800" asChild>
                            <a href="/ct-scans">{recentCt ? '자세히 보기' : '기록 관리'} <ChevronRight className="w-4 h-4 ml-1" /></a>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-rose-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> 최근 iNKt 투여
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentInkt ? (
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-gray-900">
                                    {format(new Date(recentInkt.blood_collection_date), 'yyyy.MM.dd')}
                                    <span className="text-xs font-normal text-gray-500 ml-2">(채혈일)</span>
                                </div>
                                <div className="text-sm text-gray-600 pt-2 space-y-1">
                                    <div className="flex justify-between">
                                        <span>1회차: {recentInkt.first_admin_date ? format(new Date(recentInkt.first_admin_date), 'MM.dd') : '-'}</span>
                                        <span>2회차: {recentInkt.second_admin_date ? format(new Date(recentInkt.second_admin_date), 'MM.dd') : '-'}</span>
                                    </div>
                                    {recentInkt.notes && (
                                        <div className="text-xs text-rose-600 bg-rose-50 p-1 rounded mt-1 line-clamp-1">
                                            특이사항: {recentInkt.notes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-sm">
                                <Activity className="h-8 w-8 mb-2 opacity-20" />
                                기록 없음
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" className="w-full text-rose-600 hover:text-rose-800" asChild>
                            <a href="/inkt">{recentInkt ? '자세히 보기' : '기록 관리'} <ChevronRight className="w-4 h-4 ml-1" /></a>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Recent Analysis Summary Card - Simplified */}
            {recentReport && (
                <Card className="shadow-lg border-0 ring-1 ring-gray-200 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 via-purple-50/50 to-white border-b border-gray-100 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-purple-900 text-lg">
                                <Brain className="w-5 h-5 text-purple-600" />
                                최근 AI 정밀 분석 리포트
                            </CardTitle>
                            <span className="text-sm text-gray-500">
                                {format(new Date(recentReport.created_at), 'yyyy.MM.dd')}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="prose prose-sm max-w-none text-gray-600 line-clamp-2">
                            {/* Simple summary extractor */}
                            {(recentReport.content || '').substring(0, 200) + '...'}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" asChild>
                                <Link href="/reports">
                                    전체 리포트 보기 <ChevronRight className="ml-1 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Analysis Result Modal */}
            <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-purple-900">
                            <Brain className="w-6 h-6 text-purple-600" />
                            AI 정밀 분석 완료
                        </DialogTitle>
                        <DialogDescription>
                            새로운 건강 분석 리포트가 생성되었습니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4">
                        {newReport && <ReportItem report={newReport} />}
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center bg-gray-50 -mx-6 -mb-6 p-6 mt-6 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setShowResultModal(false)}>
                            닫기
                        </Button>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button asChild variant="outline" className="flex-1 sm:flex-none">
                                <Link href="/reports">
                                    <FileText className="mr-2 h-4 w-4" /> 분석 기록함 이동
                                </Link>
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
