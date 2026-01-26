'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Download, Loader2, BarChart2, Trash2 } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import { BLOOD_TEST_RANGES } from '@/lib/constants'

interface ReportItemProps {
    report: any
}

export function ReportItem({ report }: ReportItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [pdfLoading, setPdfLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleDownloadPDF = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setPdfLoading(true)

        try {
            const { pdf } = await import('@react-pdf/renderer')
            const { ReportPDF } = await import('./report-pdf')

            const blob = await pdf(<ReportPDF report={report} />).toBlob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `health-report-${format(new Date(report.created_at), 'yyyyMMdd')}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('PDF generation failed:', error)
            alert('PDF 생성 실패: ' + (error instanceof Error ? error.message : 'Unknown error'))
        } finally {
            setPdfLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('정말로 이 분석 기록을 삭제하시겠습니까?')) return

        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('ai_reports')
                .delete()
                .eq('id', report.id)

            if (error) throw error

            router.refresh()
        } catch (error) {
            console.error('Delete failed:', error)
            alert('삭제 중 오류가 발생했습니다.')
        } finally {
            setIsDeleting(false)
        }
    }

    const getSummary = (text: string) => {
        const match = text.match(/1\.\s*\*\*종합 상태 분석\*\*:([\s\S]*?)(?=2\.|$)/)
        return match ? match[1].trim() : text.substring(0, 300) + '...'
    }

    const referenceData = report.reference_data
    const bloodTests = referenceData?.blood_tests || []

    const chartData = [...bloodTests]
        .sort((a: any, b: any) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
        .map((t: any) => ({
            name: format(new Date(t.test_date), 'MM/dd'),
            date: t.test_date,
            ...t
        }))

    const hasChartData = chartData.length > 0

    return (
        <Card className={`overflow-hidden transition-all duration-300 py-0 gap-0 ${isExpanded ? 'ring-2 ring-primary/5' : 'hover:shadow-md'}`}>
            <div
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <CardHeader className="bg-white border-b border-gray-100 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="space-y-1 w-full sm:w-auto">
                            <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 flex flex-wrap items-center gap-2 leading-tight">
                                <span className="break-keep">{format(new Date(report.created_at), 'yyyy년 MM월 dd일')} 분석 리포트</span>
                                <span className={`text-[10px] sm:text-xs font-normal px-2 py-0.5 rounded-full shrink-0 ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {isExpanded ? '상세' : '요약'}
                                </span>
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-500">
                                AI 전문의가 분석한 건강 상태 리포트입니다.
                            </CardDescription>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                            <span className="text-xs sm:text-sm text-gray-400 font-medium mr-auto sm:mr-0">
                                {format(new Date(report.created_at), 'HH:mm')}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPDF}
                                disabled={pdfLoading}
                                className="h-7 sm:h-8 gap-1 text-[10px] sm:text-xs px-2 bg-white border-gray-200"
                            >
                                {pdfLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                PDF
                            </Button>

                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                {!isExpanded && (
                    <CardContent className="p-6 sm:p-8 bg-gray-50/80 border-t border-gray-100/50">
                        <div className="text-gray-600 text-sm leading-relaxed mb-6">
                            <span className="font-bold text-gray-900 block mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                종합 상태 분석 요약
                            </span>
                            <div className="line-clamp-3 pl-1 text-gray-600">
                                {getSummary(report.content || '')}
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                className="rounded-full px-20 py-3 h-auto text-indigo-600 border-indigo-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 shadow-sm transition-all hover:shadow-md font-semibold text-sm group"
                            >
                                전체 리포트 및 상세 데이터 보기
                                <ChevronDown className="ml-1 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            </Button>
                        </div>
                    </CardContent>
                )}
            </div>

            {isExpanded && (
                <div className="animate-in slide-in-from-top-2 duration-300 print-content" style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                    <CardContent className="p-3 sm:p-6 md:p-8" ref={contentRef} style={{ backgroundColor: '#ffffff', color: '#111827' }}>


                        {/* Full Markdown Content first */}
                        <div className="mb-8 [&>h1]:border-t [&>h1]:pt-10 [&>h1]:mt-10 [&>h1:first-of-type]:border-none [&>h1:first-of-type]:pt-0 [&>h1:first-of-type]:mt-0">
                            <Markdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-xl md:text-3xl font-bold mb-6" style={{ color: '#111827', borderBottom: 'none', borderColor: '#e5e7eb' }} {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg md:text-2xl font-semibold mt-8 mb-4 pl-3" style={{ color: '#1f2937', borderLeft: '4px solid #6366f1' }} {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base md:text-xl font-semibold mt-6 mb-3" style={{ color: '#1f2937' }} {...props} />,
                                    p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-sm sm:text-base md:text-lg" style={{ color: '#374151' }} {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6" style={{ color: '#374151' }} {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-6" style={{ color: '#374151' }} {...props} />,
                                    li: ({ node, ...props }) => <li className="text-sm sm:text-base md:text-lg leading-relaxed pl-1" {...props} />,
                                    table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="w-full min-w-[600px] border-collapse" style={{ borderColor: '#e5e7eb', borderWidth: '1px' }} {...props} /></div>,
                                    thead: ({ node, ...props }) => <thead style={{ backgroundColor: '#f9fafb' }} {...props} />,
                                    th: ({ node, ...props }) => <th className="p-3 text-left font-semibold whitespace-nowrap text-sm md:text-base last:min-w-[200px]" style={{ border: '1px solid #e5e7eb', color: '#374151' }} {...props} />,
                                    td: ({ node, ...props }) => <td className="p-3 text-sm md:text-base last:min-w-[200px]" style={{ border: '1px solid #e5e7eb', color: '#374151' }} {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="pl-4 italic my-4 text-sm md:text-base" style={{ borderLeft: '4px solid #d1d5db', color: '#4b5563' }} {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-bold px-1 rounded mx-0.5" style={{ color: '#4338ca', backgroundColor: '#eef2ff' }} {...props} />,
                                }}
                            >
                                {report.content}
                            </Markdown>
                        </div>

                        {/* Charts Section below content */}
                        {hasChartData && (
                            <div className="grid md:grid-cols-2 gap-6 print:break-inside-avoid">
                                {/* Tumor Markers Chart */}
                                <div className="rounded-xl" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px', padding: '1.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: '#374151' }}>
                                        <BarChart2 style={{ width: '16px', height: '16px', color: '#6366f1' }} />
                                        주요 종양 표지자 추이
                                    </h3>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: '#ffffff' }}
                                                    cursor={{ fill: '#f3f4f6' }}
                                                />
                                                <Legend />
                                                <Bar dataKey="ca_19_9" name="CA 19-9" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                                <Bar dataKey="cea" name="CEA" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Metabolic & Electrolytes Chart */}
                                <div className="rounded-xl" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px', padding: '1.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: '#374151' }}>
                                        <BarChart2 style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                                        대사 및 전해질 주요 지표
                                    </h3>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: '#ffffff' }}
                                                    cursor={{ fill: '#f3f4f6' }}
                                                />
                                                <Legend />
                                                <Bar dataKey="glucose" name="혈당(Glucose)" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                <Bar dataKey="na" name="나트륨(Na)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 pt-6 text-center flex flex-col items-center gap-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                            <Button
                                variant="outline"
                                onClick={() => setIsExpanded(false)}
                                className="rounded-full px-8 py-2 h-auto text-gray-500 border-gray-200 bg-white hover:text-indigo-600 hover:border-indigo-200 hover:bg-gray-50"
                            >
                                요약으로 보기 <ChevronUp className="ml-1 w-4 h-4" />
                            </Button>
                            <p className="text-[11px]" style={{ color: '#9ca3af' }}>
                                * 본 리포트는 AI 보조 분석 결과이며, 의학적 진단을 대신할 수 없습니다. 반드시 주치의와 상담하세요.
                            </p>
                        </div>
                    </CardContent>
                </div>
            )}
        </Card>
    )
}
