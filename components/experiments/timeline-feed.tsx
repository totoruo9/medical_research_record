'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Activity, FileText, Scan, Syringe, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { BLOOD_TEST_RANGES } from '@/lib/constants'
import { Link } from 'lucide-react' // Wait, importing Link from lucide? No.
import NextLink from 'next/link'
import { Button } from '@/components/ui/button'

type RecordType = 'blood' | 'ct' | 'inkt' | 'report'

export interface UnifiedRecord {
    id: any
    type: RecordType
    date: string
    title: string
    summary: string
    details: any // Raw DB record
}

interface TimelineFeedProps {
    records: UnifiedRecord[]
}

export function TimelineFeed({ records }: TimelineFeedProps) {
    const [expandedIds, setExpandedIds] = useState<string[]>([])

    const toggleExpand = (uniqueId: string) => {
        setExpandedIds(prev =>
            prev.includes(uniqueId)
                ? prev.filter(id => id !== uniqueId)
                : [...prev, uniqueId]
        )
    }

    // Group by Month/Year
    const grouped: Record<string, UnifiedRecord[]> = {}
    records.forEach(r => {
        const key = format(new Date(r.date), 'yyyy년 MM월')
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(r)
    })

    const getIcon = (type: RecordType) => {
        switch (type) {
            case 'blood': return <Activity className="w-5 h-5 text-white" />
            case 'ct': return <Scan className="w-5 h-5 text-white" />
            case 'inkt': return <Syringe className="w-5 h-5 text-white" />
            case 'report': return <FileText className="w-5 h-5 text-white" />
        }
    }

    const getBgColor = (type: RecordType) => {
        switch (type) {
            case 'blood': return 'bg-red-500'
            case 'ct': return 'bg-blue-500'
            case 'inkt': return 'bg-green-500'
            case 'report': return 'bg-purple-500'
        }
    }

    // Detail Renderers
    const renderDetails = (item: UnifiedRecord) => {
        switch (item.type) {
            case 'blood':
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t mt-4">
                        {Object.entries(BLOOD_TEST_RANGES).map(([key, range]) => {
                            const val = item.details[key]
                            if (val === null || val === undefined) return null
                            // Simple range check for color
                            const isAbnormal = val < range.min || val > range.max
                            return (
                                <div key={key} className="flex flex-col p-2 rounded bg-gray-50">
                                    <span className="text-xs text-gray-500">{range.label.split('(')[0]}</span>
                                    <span className={`font-semibold ${isAbnormal ? 'text-red-500' : 'text-gray-900'}`}>
                                        {val} <span className="text-[10px] text-gray-400 font-normal">{range.unit}</span>
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )
            case 'ct':
                return (
                    <div className="space-y-4 pt-4 border-t mt-4">
                        <div>
                            <span className="font-semibold text-gray-700 block mb-1">판독 소견</span>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
                                {item.details.interpretation || '내용 없음'}
                            </p>
                        </div>
                        {item.details.doctor_opinion && (
                            <div>
                                <span className="font-semibold text-gray-700 block mb-1">의사 코멘트</span>
                                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
                                    {item.details.doctor_opinion}
                                </p>
                            </div>
                        )}
                    </div>
                )
            case 'inkt':
                return (
                    <div className="pt-4 border-t mt-4 text-sm space-y-4">
                        {/* Header: Blood Collection Date */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 text-base">채혈일: {format(new Date(item.details.blood_collection_date), 'yyyy.MM.dd')}</span>
                        </div>

                        {/* Admin Dates Grid */}
                        <div className="grid grid-cols-2 gap-8 mb-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium text-xs">1회차 투여:</span>
                                <span className="font-medium text-gray-900 text-sm">
                                    {item.details.first_admin_date ? format(new Date(item.details.first_admin_date), 'yyyy.MM.dd') : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium text-xs">2회차 투여:</span>
                                <span className="font-medium text-gray-900 text-sm">
                                    {item.details.second_admin_date ? format(new Date(item.details.second_admin_date), 'yyyy.MM.dd') : '-'}
                                </span>
                            </div>
                        </div>

                        {/* Notes / Alerts */}
                        {(item.details.notes || item.details.treatment_effect) && (
                            <div className="space-y-3">
                                {item.details.notes && (
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                            <span className="text-red-600 font-bold text-xs">특이사항:</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed text-sm">{item.details.notes}</p>
                                    </div>
                                )}
                                {item.details.treatment_effect && (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Syringe className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-green-600 font-bold text-xs">치료 효과:</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed text-sm">{item.details.treatment_effect}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            case 'report':
                return (
                    <div className="pt-4 border-t mt-4">
                        <div className="flex items-center gap-2 mb-3 bg-indigo-50 text-indigo-700 p-2 rounded text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>상세 분석은 리포트 페이지에서 확인하세요.</span>
                        </div>
                        <NextLink href={`/reports/${item.id}`}>
                            <Button className="w-full">
                                상세 리포트 보러가기
                            </Button>
                        </NextLink>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="relative border-l-2 border-gray-200 ml-4 md:ml-6 space-y-8 pb-20">
            {Object.entries(grouped).map(([month, items]) => (
                <div key={month} className="mb-8">
                    {/* Month Header */}
                    <div className="flex items-center -ml-4 mb-6">
                        <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-1.5 text-sm font-bold text-gray-600 shadow-sm z-10">
                            {month}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {items.map((item) => {
                            const uniqueId = `${item.type}-${item.id}`
                            const isExpanded = expandedIds.includes(uniqueId)

                            return (
                                <div key={uniqueId} className="relative group ml-4 md:ml-6">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[35px] md:-left-[43px] mt-1 p-2 rounded-full ring-4 ring-white ${getBgColor(item.type)} shadow-sm z-10`}>
                                        {getIcon(item.type)}
                                    </div>

                                    {/* Card */}
                                    <Card
                                        className={`cursor-pointer transition-all duration-300 border-l-4 ${isExpanded ? 'shadow-md ring-1 ring-primary/10' : 'hover:shadow-md hover:-translate-y-0.5'}`}
                                        style={{ borderLeftColor: isExpanded ? 'var(--primary)' : 'transparent' }}
                                        onClick={() => toggleExpand(uniqueId)}
                                    >
                                        <CardContent className="p-4 sm:p-5">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="font-bold text-gray-900 text-lg">{item.title}</span>
                                                        <Badge variant="secondary" className="text-xs font-normal">
                                                            {format(new Date(item.date), 'dd일 (eee)')}
                                                        </Badge>
                                                        {item.type === 'report' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">AI 분석</Badge>}
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-1">{item.summary}</p>
                                                </div>
                                                <div className="text-gray-400 ml-2">
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                                    {renderDetails(item)}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
