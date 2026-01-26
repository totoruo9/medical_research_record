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
    const [recentReports, setRecentReports] = useState<any[]>([]) // For the dashboard summary card

    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()
        const { data: reports } = await supabase.from('ai_reports').select('*').order('created_at', { ascending: false }).limit(5)
        if (reports && reports.length > 0) setRecentReports(reports)

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
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        안녕하세요, <span className="text-primary">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>님!
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">오늘의 건강 상태를 확인하세요.</p>
                </div>
                <div className="flex gap-3">
                    {recentTest || recentCt ? (
                        <Button onClick={handleAnalyze} disabled={loading} size="lg" className="shadow-xl shadow-primary/20">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Brain className="mr-2" />}
                            {loading ? 'AI 정밀 분석 중...' : 'AI 정밀 분석 실행'}
                        </Button>
                    ) : (
                        <Button asChild size="lg" className="shadow-xl shadow-primary/20">
                            <Link href="/blood-tests">
                                <Activity className="mr-2" /> 초기 데이터 입력
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ... (Existing Metric Cards Code) ... */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500 h-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> 최근 혈액 검사
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
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
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Activity className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">혈액 검사 기록 없음</p>
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

                <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-teal-500 h-full">
                    {/* ... CT Scan Card Content ... */}
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> 최근 CT 판독
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
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

                <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-rose-500 h-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> 최근 iNKt 투여
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
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
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Activity className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">혈액 검사 기록 없음</p>
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

            {/* Recent Analysis Summary Card */}
            {/* Recent Analysis Summary Card */}
            {recentReports.length > 0 && (
                <Card className="shadow-lg border-none ring-1 ring-black/5 overflow-hidden group py-0 gap-0">
                    <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-white pt-5 pb-0 gap-0 border-b border-indigo-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-indigo-950 text-lg font-bold">
                                <div className="p-2 bg-indigo-100/50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                    <Brain className="w-5 h-5 text-indigo-600" />
                                </div>
                                최근 AI 정밀 분석
                            </CardTitle>
                            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 hover:bg-transparent font-medium h-auto text-xs p-0 pr-0" asChild>
                                <Link href="/reports" className="flex items-center">
                                    전체보기 <ChevronRight className="ml-0.5 w-3 h-3" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {recentReports.map((report, index) => (
                                <div key={report.id} className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors group/item">
                                    <Link href="/reports" className="block">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900 group-hover/item:text-indigo-700 transition-colors">
                                                    {format(new Date(report.created_at), 'yyyy.MM.dd')} 분석 리포트
                                                </span>
                                                {index === 0 && (
                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">NEW</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(report.created_at), 'HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                            {report.content
                                                ? report.content.replace(/#{1,6}\s|[*`]/g, '').trim()
                                                : '분석 내용이 없습니다.'}
                                        </p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Analysis Result Modal */}
            <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
                <DialogContent className="fixed z-50 w-full h-[100dvh] max-w-none rounded-none top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-4xl sm:rounded-xl p-0 overflow-hidden flex flex-col gap-0 border-0 sm:border bg-background shadow-none sm:shadow-lg">
                    <DialogHeader className="p-6 pb-4 pt-20 shrink-0 relative flex flex-col items-center justify-center space-y-0 text-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-white text-gray-900 shadow-lg border border-gray-100 hover:bg-gray-50 w-12 h-12 z-10"
                            onClick={() => setShowResultModal(false)}
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </Button>

                        <div className="flex flex-col gap-2 items-center w-full">
                            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-purple-900">
                                <Brain className="w-7 h-7 text-purple-600" />
                                AI 정밀 분석 완료
                            </DialogTitle>
                            <DialogDescription className="text-base text-gray-500 text-center">
                                새로운 건강 분석 리포트가 생성되었습니다.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 pt-0 min-h-0 overscroll-contain bg-white">
                        {newReport && <ReportItem report={newReport} />}
                    </div>

                    <DialogFooter className="shrink-0 flex items-center p-6 border-t border-gray-100 bg-gray-50/95 backdrop-blur-sm sm:justify-end">
                        <Button asChild variant="default" size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 text-white font-semibold">
                            <Link href="/reports">
                                <FileText className="mr-2 h-5 w-5" /> 분석 기록함 이동
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
