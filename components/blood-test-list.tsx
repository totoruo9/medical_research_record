'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { MoreHorizontal, Trash2, Edit2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteBloodTest } from '@/lib/actions/blood-test'
import { BLOOD_TEST_RANGES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BloodTestForm } from './blood-test-form'

interface BloodTestListProps {
    initialTests: any[]
}

export function BloodTestList({ initialTests }: BloodTestListProps) {
    const [tests, setTests] = useState(initialTests)
    // ID of the currently expanded test
    const [expandedIds, setExpandedIds] = useState<number[]>([])
    // ID of the test currently being edited
    const [editingId, setEditingId] = useState<number | null>(null)

    const [selectedMetrics, setSelectedMetrics] = useState<Record<number, string | null>>({})

    const handleMetricClick = (testId: number, key: string) => {
        setSelectedMetrics(prev => ({
            ...prev,
            [testId]: prev[testId] === key ? null : key
        }))
    }

    const handleDelete = async (id: number) => {
        if (confirm('정말 이 기록을 삭제하시겠습니까?')) {
            await deleteBloodTest(id)
            setTests(tests.filter(t => t.id !== id))
            if (expandedIds.includes(id)) {
                setExpandedIds(expandedIds.filter(eid => eid !== id))
            }
        }
    }

    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        )
        // Close edit mode if collapsing
        if (expandedIds.includes(id) && editingId === id) {
            setEditingId(null)
        }
    }

    const startEdit = (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        setEditingId(id)
        // Ensure it's expanded when editing
        if (!expandedIds.includes(id)) {
            setExpandedIds(prev => [...prev, id])
        }
    }

    const cancelEdit = () => {
        setEditingId(null)
    }

    const handleSuccess = () => {
        setEditingId(null)
        window.location.reload()
    }

    // New helper for Deviation Logic
    const getStatusHelper = (key: string, value: number) => {
        const range = BLOOD_TEST_RANGES[key]
        if (!range || value === null || value === undefined) return { color: 'text-gray-500', icon: null, badge: null, dotColor: '#8884d8' }

        const { min, max } = range

        // Normal Range
        if (value >= min && value <= max) {
            return {
                color: 'text-green-600',
                icon: null,
                badge: <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px] px-1 py-0 h-4">Normal</Badge>,
                dotColor: '#16a34a' // green-600
            }
        }

        // Deviation Calculation
        const isLow = value < min
        const diff = isLow ? min - value : value - max
        const limit = isLow ? min : max
        const ratio = diff / limit // deviation ratio

        // Color Logic: Yellow (Interest) -> Orange (Caution) -> Red (Danger)
        let colorClass = 'text-yellow-600'
        let badgeColorClass = 'text-yellow-600 border-yellow-200 bg-yellow-50'
        let dotColor = '#ca8a04' // yellow-600
        let label = 'Interest'

        if (ratio > 0.3) { // >30% deviation
            colorClass = 'text-red-600'
            badgeColorClass = 'text-red-600 border-red-200 bg-red-50'
            dotColor = '#dc2626' // red-600
            label = 'Danger'
        } else if (ratio > 0.1) { // 10-30% deviation
            colorClass = 'text-orange-500' // orange-500 for better visibility than 600 sometimes
            badgeColorClass = 'text-orange-600 border-orange-200 bg-orange-50'
            dotColor = '#f97316' // orange-500
            label = 'Caution'
        }

        return {
            color: colorClass,
            icon: <span className="text-[10px] ml-1">{isLow ? '▼' : '▲'}</span>,
            badge: <Badge variant="outline" className={`${badgeColorClass} text-[10px] px-1 py-0 h-4`}>{label}</Badge>,
            dotColor: dotColor
        }
    }

    const MAIN_KEYS = ['ca_19_9', 'cea', 'wbc_count', 'neutrophil']

    // Chart helpers
    const getChartData = (currentTestId: number) => {
        const sorted = [...tests].sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
        const currentIndex = sorted.findIndex(t => t.id === currentTestId)
        if (currentIndex === -1) return []
        const start = Math.max(0, currentIndex - 4)
        return sorted.slice(start, currentIndex + 1).map(t => ({
            ...t,
            date: format(new Date(t.test_date), 'yy.MM.dd')
        }))
    }

    const CustomDot = (props: any) => {
        const { cx, cy, payload, dataKey } = props;
        const value = payload[dataKey];
        const status = getStatusHelper(dataKey, value);

        return (
            <svg x={cx - 4} y={cy - 4} width={8} height={8} fill={status.dotColor} viewBox="0 0 1024 1024">
                <circle cx="512" cy="512" r="512" />
            </svg>
        );
    };

    const SingleMetricChart = ({ data, dataKey, range }: { data: any[], dataKey: string, range: any }) => (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[
                    (dataMin: number) => Math.min(dataMin, range.min) * 0.9,
                    (dataMax: number) => Math.max(dataMax, range.max) * 1.1
                ]} />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={<CustomDot dataKey={dataKey} />}
                    name={range.label.split('(')[0]}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )

    return (
        <div className="grid gap-4">
            {tests.length === 0 ? (
                <Card>
                    <CardContent className="h-40 flex flex-col items-center justify-center text-gray-500">
                        기록된 혈액 검사 데이터가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                tests.map((test) => {
                    const isExpanded = expandedIds.includes(test.id)
                    const isEditing = editingId === test.id
                    const chartData = getChartData(test.id)
                    const selectedMetricKey = selectedMetrics[test.id]

                    return (
                        <Card key={test.id} className={`transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/5' : ''}`}>
                            <div
                                className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                                onClick={() => toggleExpand(test.id)}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-semibold text-gray-800">
                                            검사일: {format(new Date(test.test_date), 'yyyy.MM.dd')}
                                        </CardTitle>
                                        {!isExpanded && <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        {isExpanded && <ChevronUp className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">메뉴 열기</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => startEdit(e, test.id)}>
                                                    <Edit2 className="mr-2 h-4 w-4" /> 수정
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(test.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> 삭제
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Main Summary Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {MAIN_KEYS.map(key => {
                                            const value = test[key]
                                            const range = BLOOD_TEST_RANGES[key]
                                            const status = getStatusHelper(key, value)
                                            return (
                                                <div key={key} className="flex flex-col space-y-1">
                                                    <span className="text-xs text-gray-500 uppercase">{range?.label.split('(')[0]}</span>

                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-sm font-semibold ${status.color}`}>
                                                            {value !== null ? value : '-'}
                                                        </span>
                                                        {status.icon}
                                                    </div>
                                                    {status.badge}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="border-t bg-gray-50/30 p-4 md:p-6 animate-in slide-in-from-top-2 duration-200">
                                    {isEditing ? (
                                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Edit2 className="w-5 h-5" /> 기록 수정
                                            </h3>
                                            <BloodTestForm
                                                initialData={test}
                                                onSuccess={handleSuccess}
                                                onCancel={cancelEdit}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Detailed List */}
                                            <div className="md:w-1/2 grid grid-cols-1 gap-3 content-start">
                                                <h4 className="font-semibold text-gray-800 mb-2">상세 수치 (클릭하여 추이 확인)</h4>
                                                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                                                    {Object.entries(BLOOD_TEST_RANGES).map(([key, range]) => {
                                                        const value = test[key]
                                                        if (value === null || value === undefined) return null
                                                        const status = getStatusHelper(key, value)
                                                        const isSelected = selectedMetricKey === key

                                                        return (
                                                            <div
                                                                key={key}
                                                                className={`flex items-center justify-between p-3 rounded-md border shadow-sm cursor-pointer transition-all
                                                                    ${isSelected ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-100 hover:bg-gray-50'}
                                                                `}
                                                                onClick={() => handleMetricClick(test.id, key)}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>{range.label.split('(')[0]}</span>
                                                                    <span className="text-xs text-gray-400">{range.label.match(/\((.*?)\)/)?.[1] || ''}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-base font-bold ${status.color} flex items-center justify-end gap-1`}>
                                                                        {value}
                                                                        {status.icon}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        {range.min}~{range.max} {range.unit}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* Chart Section */}
                                            <div className="md:w-1/2 flex flex-col">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold text-gray-800">
                                                        {selectedMetricKey ? `${BLOOD_TEST_RANGES[selectedMetricKey]?.label.split('(')[0]} 추이` : '주요 수치 추이 (최근 5회)'}
                                                    </h4>
                                                    {selectedMetricKey && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleMetricClick(test.id, selectedMetricKey)} className="text-xs h-6">
                                                            주요 지표로 복귀
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border shadow-sm h-[400px]">
                                                    {selectedMetricKey ? (
                                                        <SingleMetricChart
                                                            data={chartData}
                                                            dataKey={selectedMetricKey}
                                                            range={BLOOD_TEST_RANGES[selectedMetricKey]}
                                                        />
                                                    ) : (
                                                        <Tabs defaultValue="tumor" className="w-full h-full flex flex-col">
                                                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                                                <TabsTrigger value="tumor">종양 표지자</TabsTrigger>
                                                                <TabsTrigger value="blood">혈액/염증</TabsTrigger>
                                                                <TabsTrigger value="liver">간/췌장</TabsTrigger>
                                                            </TabsList>
                                                            <TabsContent value="tumor" className="flex-1 min-h-0">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                                                        <Tooltip
                                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                        />
                                                                        <Line type="monotone" dataKey="ca_19_9" stroke="#ef4444" strokeWidth={2} dot={<CustomDot dataKey="ca_19_9" />} name="CA 19-9" activeDot={{ r: 6 }} />
                                                                        <Line type="monotone" dataKey="cea" stroke="#f97316" strokeWidth={2} dot={<CustomDot dataKey="cea" />} name="CEA" activeDot={{ r: 6 }} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </TabsContent>
                                                            <TabsContent value="blood" className="flex-1 min-h-0">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                                                        <Tooltip />
                                                                        <Line type="monotone" dataKey="wbc_count" stroke="#3b82f6" strokeWidth={2} dot={<CustomDot dataKey="wbc_count" />} name="WBC" />
                                                                        <Line type="monotone" dataKey="neutrophil" stroke="#10b981" strokeWidth={2} dot={<CustomDot dataKey="neutrophil" />} name="Neutrophil" />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </TabsContent>
                                                            <TabsContent value="liver" className="flex-1 min-h-0">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                                                        <Tooltip />
                                                                        <Line type="monotone" dataKey="alt" stroke="#8b5cf6" strokeWidth={2} dot={<CustomDot dataKey="alt" />} name="ALT" />
                                                                        <Line type="monotone" dataKey="ast" stroke="#6366f1" strokeWidth={2} dot={<CustomDot dataKey="ast" />} name="AST" />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </TabsContent>
                                                        </Tabs>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    )
                })
            )}
        </div>
    )
}

