'use client'

import React, { useState } from 'react'
import {
    LButton, LBadge, LCard, LCardHeader, LCardContent, LCardTitle, LCardFooter,
    LAlert, LInput, LAvatar, LHeader, LNav, LNavLink, LMetricCard, LEmptyState,
    LImageCard, LDropdown, LDropdownItem, LExpandableCard,
    LFooter, LFooterSection, LFooterLink,
    LHero, LHeroTitle, LHeroSubtitle, LProfile, LModal, LModalFooter, linearTheme,
    LTabs, LTabsList, LTabsTrigger, LTabsContent,
    LTimeline, LTimelineDate, LTimelineItem, LTimelineIcon, LTimelineContent
} from '@/components/linear-ui'
import {

    Activity, FileText, Brain, ChevronRight, Plus, Calendar,
    Search, Bell, Settings, LogOut, User, LayoutDashboard,
    Stethoscope, Clock, AlertCircle, CheckCircle2, Info, ChevronDown, Download, Trash2, Edit2,
    Syringe, Pill, Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { BloodTestForm } from '@/components/blood-test-form'
import { CTScanForm } from '@/components/ct-scan-form'
import { InktRecordForm } from '@/components/inkt-record-form'
import { toast } from 'sonner'

type BloodTest = any
type Report = any
type CTScan = any
type InktRecord = any
type UserProfile = { user_metadata: { full_name?: string, avatar_url?: string, email?: string } }

import { BLOOD_TEST_RANGES } from '@/lib/constants'

// Helper for status logic with detailed severity
function getDetailedMetricStatus(key: string, value: number | null | undefined) {
    if (value === null || value === undefined) return { status: 'normal', color: 'text-gray-400', bg: 'bg-gray-50' }

    const range = BLOOD_TEST_RANGES[key]
    if (!range) return { status: 'normal', color: 'text-gray-900', bg: 'bg-gray-50' }

    // Normal
    if (value >= range.min && value <= range.max) {
        return { status: 'normal', color: 'text-gray-900', bg: 'bg-gray-50' }
    }

    // Abnormal logic
    let deviation = 0
    if (value > range.max) deviation = (value - range.max) / range.max
    if (value < range.min) deviation = (range.min - value) / range.min

    // Severity Thresholds
    if (deviation < 0.2) return { status: 'caution', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (deviation < 1.0) return { status: 'warning', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50' }
}

function getMetricStatus(key: string, value: number | null) {
    // Legacy wrapper or keep for compatibility if used elsewhere (L480)
    const detailed = getDetailedMetricStatus(key, value)
    return {
        status: detailed.status === 'normal' ? 'normal' : 'warning',
        color: detailed.color
    }
}

interface LinearDashboardClientProps {
    user: UserProfile
    initialBloodTests: BloodTest[]
    initialReports: Report[]
    initialTimeline: any[] // Mixed types
    activeTab?: 'dashboard' | 'analysis'
}

export default function LinearDashboardClient({ user, initialBloodTests, initialTimeline, initialReports, activeTab = 'dashboard' }: LinearDashboardClientProps) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [visibleItems, setVisibleItems] = useState(5)
    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [hasUnreadNotification, setHasUnreadNotification] = useState(false)
    const [analysisResultReady, setAnalysisResultReady] = useState(false)
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleDeleteReport = async (reportId: string) => {
        if (!confirm('이 분석 리포트를 삭제하시겠습니까?')) return

        try {
            const { error } = await supabase
                .from('ai_reports')
                .delete()
                .eq('id', reportId)

            if (error) throw error

            toast.success('리포트가 삭제되었습니다.')
            router.refresh()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('리포트 삭제에 실패했습니다.')
        }
    }

    // Derived Metrics
    const latestTest = initialBloodTests[0]
    const metrics = [
        { key: 'ca_19_9', label: 'CA 19-9', value: latestTest?.ca_19_9 },
        { key: 'cea', label: 'CEA', value: latestTest?.cea },
        { key: 'wbc_count', label: 'WBC', value: latestTest?.wbc_count },
        { key: 'neutrophil', label: 'Neutrophil', value: latestTest?.neutrophil }
    ]

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleAnalysis = async () => {
        setIsAnalyzing(true)
        setAnalysisResultReady(false) // Reset previous result

        try {
            const res = await fetch('/api/analyze', { method: 'POST' })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'AI 분석 중 오류가 발생했습니다.')
            }

            setHasUnreadNotification(true)
            setAnalysisResultReady(true)
            toast.success("AI 정밀 분석이 완료되었습니다.", {
                description: "AI 분석 리포트에서 결과를 확인해주세요."
            })
            router.refresh() // Refresh to load the new report from server
        } catch (error: any) {
            console.error('Analysis failed:', error)
            toast.error("분석 실패", {
                description: error.message || "분석을 완료할 수 없습니다."
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50" style={{ fontFamily: linearTheme.typography.fontFamily }}>
            {/* Navbar */}
            <LHeader>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <img src="/favicon.ico" alt="I-Eum" className="h-8 w-8 rounded-lg" />
                        <span className="text-lg font-bold text-gray-900 tracking-tight">I-Eum</span>
                    </div>
                    <LNav className="hidden md:flex space-x-1">
                        <LNavLink href="#" active={activeTab === 'dashboard'} onClick={() => router.push('/dashboard')}>Dashboard</LNavLink>
                        <LNavLink href="#" active={activeTab === 'analysis'} onClick={() => router.push('/analysis')}>AI Analysis</LNavLink>
                    </LNav>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-gray-500 hover:text-gray-700 transition-colors"><Search className="h-5 w-5" /></button>
                    <LDropdown
                        open={notificationDropdownOpen}
                        onOpenChange={setNotificationDropdownOpen}
                        trigger={
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors relative flex items-center justify-center p-1"
                                onClick={() => {
                                    setHasUnreadNotification(false)
                                    // Standard dropdown behavior will toggle open state, but we also clear notification
                                }}
                            >
                                <Bell className="h-5 w-5" />
                                {hasUnreadNotification && (
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        }>
                        <div className="py-1 min-w-[240px]">
                            <div className="px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500">알림</div>
                            {analysisResultReady ? (
                                <LDropdownItem onClick={() => {
                                    router.push('/analysis');
                                    setHasUnreadNotification(false);
                                    setAnalysisResultReady(false);
                                    setNotificationDropdownOpen(false);
                                }}>
                                    <div className="flex flex-col items-start gap-0.5">
                                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                            <Brain className="h-3.5 w-3.5 text-purple-600" />
                                            AI 정밀 분석 완료
                                        </div>
                                        <span className="text-xs text-gray-500">분석 리포트 확인하기</span>
                                    </div>
                                </LDropdownItem>
                            ) : (
                                <div className="px-3 py-6 text-center text-sm text-gray-400">
                                    메시지가 없습니다.
                                </div>
                            )}
                        </div>
                    </LDropdown>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <LProfile
                        name={user.user_metadata.full_name || 'User'}
                        email={user.user_metadata.email}
                        avatarSrc={user.user_metadata.avatar_url}
                        onLogout={handleSignOut}
                    />
                </div>
            </LHeader>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Dashboard View */}
                {activeTab === 'dashboard' && (
                    <>
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {user.user_metadata.full_name || '환자'}님 👋</h1>
                                <p className="text-gray-500 mt-1">오늘의 건강 상태 요약입니다.</p>
                            </div>
                            <div className="flex gap-2">
                                <LButton
                                    onClick={handleAnalysis}
                                    disabled={isAnalyzing}
                                    className="bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 hover:border-purple-200 min-w-[160px]"
                                    variant="outline"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                            AI 정밀분석 진행중
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-1.5" />
                                            AI 정밀 분석
                                        </>
                                    )}
                                </LButton>
                                <LButton onClick={() => setIsUploadModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-1.5" /> 기록 추가
                                </LButton>
                            </div>
                        </div>

                        {/* Status Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <LCard className="p-4 flex items-center justify-between border-l-4 border-l-green-500">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">종합 상태</p>
                                    <h3 className="text-lg font-bold text-green-700 mt-0.5">안정적</h3>
                                </div>
                                <div className="h-10 w-10 text-green-600 bg-green-50 rounded-full flex items-center justify-center"><CheckCircle2 className="h-6 w-6" /></div>
                            </LCard>
                            {/* ... more status cards placeholders or logic ... */}
                            <LCard className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">다음 검진</p>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">D-14</h3>
                                </div>
                                <div className="h-10 w-10 text-blue-600 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Calendar className="h-6 w-6" />
                                </div>
                            </LCard>
                            <LCard className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">AI 리포트</p>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">최신 ({initialReports[0] ? format(new Date(initialReports[0].created_at), 'MM.dd') : '-'})</h3>
                                </div>
                                <div className="h-10 w-10 text-purple-600 bg-purple-50 rounded-full flex items-center justify-center"><Brain className="h-6 w-6" /></div>
                            </LCard>
                            <LCard className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">최근 혈액 검사</p>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                                        {initialBloodTests && initialBloodTests.length > 0
                                            ? format(new Date(initialBloodTests[0].test_date), 'yy.MM.dd')
                                            : '-'}
                                    </h3>
                                </div>
                                <div className="h-10 w-10 text-red-600 bg-red-50 rounded-full flex items-center justify-center">
                                    <Activity className="h-6 w-6" />
                                </div>
                            </LCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Metrics Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Activity className="h-5 w-5 text-gray-500" /> 주요 종양 표지자</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {metrics.map((m, i) => {
                                            const status = getDetailedMetricStatus(m.key, m.value)
                                            return (
                                                <LCard key={i} hover className="p-4">
                                                    <div className="text-xs text-gray-500 mb-2 font-medium">{m.label}</div>
                                                    <div className="flex items-end gap-1.5">
                                                        <span className={cn("text-2xl font-bold tracking-tight", status.color)}>{m.value ?? '-'}</span>
                                                        <span className="text-xs text-gray-400 mb-1.5">{BLOOD_TEST_RANGES[m.key]?.unit || ''}</span>
                                                    </div>
                                                    <div className={cn("mt-2 flex items-center gap-1 text-[10px] font-medium", status.status === 'normal' ? "text-blue-600" : status.color)}>
                                                        {status.status === 'normal' ? (
                                                            <><CheckCircle2 className="h-3 w-3" /> 정상 범위</>
                                                        ) : (
                                                            <><AlertCircle className="h-3 w-3" />
                                                                {status.status === 'caution' ? '주의' : status.status === 'warning' ? '경고' : '위험'}
                                                            </>
                                                        )}
                                                    </div>
                                                </LCard>
                                            )
                                        })}
                                    </div>
                                </section>

                                {/* Timeline Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clock className="h-5 w-5 text-gray-500" /> 최근 활동 내역</h2>
                                    </div>
                                    <LTimeline>
                                        {(() => {
                                            const displayedTimeline = initialTimeline
                                                .filter((item: any) => item.type !== 'ai_report')
                                                .slice(0, visibleItems)

                                            const grouped = displayedTimeline.reduce((acc: any, item: any) => {
                                                const date = new Date(item.date)
                                                const key = format(date, 'yyyy년 MM월')
                                                if (!acc[key]) acc[key] = []
                                                acc[key].push(item)
                                                return acc
                                            }, {})

                                            return Object.entries(grouped).map(([dateKey, items]: [string, any]) => (
                                                <React.Fragment key={dateKey}>
                                                    <LTimelineDate>{dateKey}</LTimelineDate>
                                                    {items.map((item: any) => (
                                                        <LTimelineItem key={item.id}>
                                                            <LTimelineIcon variant={item.type === 'blood_test' ? 'danger' : item.type === 'inkt' ? 'success' : 'default'}>
                                                                {item.type === 'blood_test' ? <Activity className="h-5 w-5" /> :
                                                                    item.type === 'inkt' ? <Syringe className="h-5 w-5" /> :
                                                                        item.type === 'ct_scan' ? <Brain className="h-5 w-5" /> :
                                                                            <FileText className="h-5 w-5" />}
                                                            </LTimelineIcon>
                                                            <LTimelineContent>
                                                                {/* This replaces LExpandableCard entirely with a simplified card view inside Timeline */}
                                                                <LExpandableCard
                                                                    title={item.type === 'blood_test' ? '혈액 검사' : item.type === 'ct_scan' ? 'CT 검사' : 'iNTk 치료'}
                                                                    subtitle={`${format(new Date(item.date), 'dd일 (eee)')} • ${item.summary || '상세 내역'}`}
                                                                    className="mb-6 shadow-sm border-gray-100"
                                                                >
                                                                    <div className="pt-2">
                                                                        {item.type === 'blood_test' ? (
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                                {[
                                                                                    { label: 'Calcium', value: item.details.calcium, unit: 'mg/dL' },
                                                                                    { label: 'Inorganic P', value: item.details.inorganic_p, unit: 'mg/dL' },
                                                                                    { label: 'Glucose', value: item.details.glucose, unit: 'mg/dL' },
                                                                                    { label: 'BUN', value: item.details.bun, unit: 'mg/dL' },
                                                                                    { label: 'Creatinine', value: item.details.creatinine, unit: 'mg/dL' },
                                                                                    { label: 'Uric Acid', value: item.details.uric_acid, unit: 'mg/dL' },
                                                                                    { label: 'Total cholesterol', value: item.details.total_cholesterol, unit: 'mg/dL' },
                                                                                    { label: 'Total Protein', value: item.details.total_protein, unit: 'g/dL' },
                                                                                    { label: 'Albumin', value: item.details.albumin, unit: 'g/dL' },
                                                                                    { label: 'Alk. Phos', value: item.details.alk_phos, unit: 'IU/L' },
                                                                                    { label: 'AST', value: item.details.ast, unit: 'IU/L' },
                                                                                    { label: 'ALT', value: item.details.alt, unit: 'IU/L' },
                                                                                    { label: 'T. Bilirubin', value: item.details.t_bilirubin, unit: 'mg/dL' },
                                                                                    { label: 'Gamma-GT', value: item.details.gamma_gt, unit: 'IU/L' },
                                                                                    { label: 'Na', value: item.details.na, unit: 'mmol/L' },
                                                                                    { label: 'K', value: item.details.k, unit: 'mmol/L' },
                                                                                    { label: 'Cl', value: item.details.cl, unit: 'mmol/L' },
                                                                                    { label: 'Amylase', value: item.details.amylase, unit: 'U/L' },
                                                                                    { label: 'Lipase', value: item.details.lipase, unit: 'U/L' },
                                                                                    { label: 'WBC COUNT', value: item.details.wbc_count, unit: '10^3/uL' },
                                                                                    { label: 'RBC COUNT', value: item.details.rbc_count, unit: '10^6/uL' },
                                                                                    { label: 'Hemoglobin', value: item.details.hemoglobin, unit: 'g/dL' },
                                                                                    { label: 'Hct', value: item.details.hct, unit: '%' },
                                                                                    { label: 'Neutrophil', value: item.details.neutrophil, unit: '10^3/uL' },
                                                                                    { label: 'CEA', value: item.details.cea, unit: 'ng/mL' },
                                                                                    { label: 'CA 19-9', value: item.details.ca_19_9, unit: 'U/mL' },
                                                                                ].map((metric, idx) => (
                                                                                    <div key={idx} className="bg-gray-50 rounded-sm p-3">
                                                                                        <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                                                                                        <div className="flex items-baseline gap-1">
                                                                                            <span className={cn("text-sm font-bold", getMetricStatus(metric.label.toLowerCase().replace(/ /g, '_').replace(/\./g, ''), metric.value).color)}>
                                                                                                {metric.value ?? '-'}
                                                                                            </span>
                                                                                            <span className="text-[10px] text-gray-400">{metric.unit}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : item.type === 'inkt' ? (
                                                                            <div className="space-y-4">
                                                                                <div className="bg-gray-50/50 p-4 rounded-sm border border-gray-100">
                                                                                    <h4 className="font-bold text-gray-900 mb-2">채혈일: {item.details.blood_collection_date ? format(new Date(item.details.blood_collection_date), 'yyyy.MM.dd') : '-'}</h4>
                                                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                                                        <div>
                                                                                            <span className="text-gray-500 block mb-1">1회차 투여:</span>
                                                                                            <span className="font-medium text-gray-900">{item.details.first_admin_date ? format(new Date(item.details.first_admin_date), 'yyyy.MM.dd') : '-'}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-gray-500 block mb-1">2회차 투여:</span>
                                                                                            <span className="font-medium text-gray-900">{item.details.second_admin_date ? format(new Date(item.details.second_admin_date), 'yyyy.MM.dd') : '-'}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {(item.details.notes) && (
                                                                                    <div className="rounded-sm bg-red-50 p-4 border border-red-100">
                                                                                        <div className="flex items-center gap-2 mb-2">
                                                                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                                                                            <span className="text-xs font-bold text-red-700 uppercase">특이사항</span>
                                                                                        </div>
                                                                                        <p className="text-sm text-red-800 leading-relaxed font-medium">{item.details.notes}</p>
                                                                                    </div>
                                                                                )}

                                                                                {(item.details.treatment_effect) && (
                                                                                    <div className="rounded-sm bg-green-50 p-4 border border-green-100">
                                                                                        <div className="flex items-center gap-2 mb-2">
                                                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                                            <span className="text-xs font-bold text-green-700 uppercase">치료 효과</span>
                                                                                        </div>
                                                                                        <p className="text-sm text-green-800 leading-relaxed font-medium">{item.details.treatment_effect}</p>
                                                                                    </div>
                                                                                )}

                                                                                {(!item.details.notes && !item.details.treatment_effect) && (
                                                                                    <p className="text-sm text-gray-400 italic text-center py-2">기록된 특이사항이나 효과가 없습니다.</p>
                                                                                )}
                                                                            </div>
                                                                        ) : item.type === 'ct_scan' ? (
                                                                            <div className="space-y-3">
                                                                                {item.details.cancer_size && (
                                                                                    <div className="mb-2">
                                                                                        <span className="text-xs font-bold text-gray-500 uppercase block mb-0.5">종양 크기</span>
                                                                                        <p className="text-sm font-medium text-gray-900">{item.details.cancer_size}</p>
                                                                                    </div>
                                                                                )}
                                                                                {item.details.interpretation && (
                                                                                    <div className="mb-2">
                                                                                        <span className="text-xs font-bold text-gray-500 uppercase block mb-0.5">판독 소견</span>
                                                                                        <p className="text-sm text-gray-700">{item.details.interpretation}</p>
                                                                                    </div>
                                                                                )}
                                                                                {item.details.doctor_opinion && (
                                                                                    <div className="rounded-md bg-blue-50 p-3 border border-blue-100 mt-2">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <Stethoscope className="h-4 w-4 text-blue-600" />
                                                                                            <span className="text-xs font-bold text-blue-700 uppercase">의사 소견</span>
                                                                                        </div>
                                                                                        <p className="text-sm text-blue-800">{item.details.doctor_opinion}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-600">{JSON.stringify(item.details)}</p>
                                                                        )}
                                                                    </div>
                                                                </LExpandableCard>
                                                            </LTimelineContent>
                                                        </LTimelineItem>
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        })()}
                                    </LTimeline>
                                    {initialTimeline.filter((item: any) => item.type !== 'ai_report').length === 0 && <LEmptyState>기록이 없습니다.</LEmptyState>}
                                    {initialTimeline.filter((item: any) => item.type !== 'ai_report').length > visibleItems && (
                                        <div className="flex justify-center mt-4">
                                            <LButton variant="secondary" onClick={() => setVisibleItems(prev => prev + 5)}>
                                                더보기 <ChevronDown className="h-4 w-4 ml-1" />
                                            </LButton>
                                        </div>
                                    )}
                                </section>
                            </div>

                            <div className="space-y-6">
                                {/* AI Insights */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Brain className="h-5 w-5 text-gray-500" /> AI 건강 인사이트</h2>
                                    </div>
                                    {initialReports[0] ? (
                                        <LImageCard
                                            title="최신 분석 리포트"
                                            description="최근 검사 결과를 바탕으로 한 AI 분석입니다."
                                            tag="NEW"
                                            className="mb-4"
                                            actions={<LButton size="sm" className="w-full" onClick={() => router.push('/analysis')}>전체 리포트 읽기</LButton>}
                                        />
                                    ) : (
                                        <LEmptyState>분석 리포트가 없습니다.</LEmptyState>
                                    )}
                                </section>
                            </div>
                        </div>
                    </>
                )
                }


                {/* Analysis Tab */}
                {
                    activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">AI 분석 리포트</h2>
                            {initialReports.map((report) => (
                                <div key={report.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    {/* Report Header */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <h3 className="text-2xl font-bold text-gray-700 tracking-tight">
                                                    {format(new Date(report.created_at), 'yyyy년 MM월 dd일 분석 리포트')}
                                                </h3>

                                            </div>
                                            <p className="text-sm text-gray-500">AI 전문의가 분석한 건강 상태 리포트입니다.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-medium mr-2">{format(new Date(report.created_at), 'HH:mm')}</span>
                                            <LButton variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-gray-600">
                                                <FileText className="h-3.5 w-3.5" /> PDF
                                            </LButton>
                                            <LButton
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                onClick={() => handleDeleteReport(report.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </LButton>
                                        </div>
                                    </div>

                                    {/* Data Source Toggle */}
                                    <details className="mb-8 group border border-gray-100 rounded-lg open:bg-gray-50/50 transition-colors">
                                        <summary className="flex items-center justify-between p-3.5 cursor-pointer list-none select-none hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">데이터 근거</span>
                                                <span className="text-xs text-gray-500 font-medium">이 분석에 사용된 의료 기록 (펼쳐보기)</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                                        </summary>
                                        <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                                            {report.reference_data ? (
                                                <div className="space-y-1.5 text-xs text-gray-600">
                                                    <p className="font-bold text-gray-700 mb-2">[사용된 데이터 요약]</p>
                                                    <div>• 혈액 검사: {report.reference_data.blood_tests?.length || 0}건</div>
                                                    <div>• CT 검사: {report.reference_data.ct_scans?.length || 0}건</div>
                                                    <div>• iNKt 치료: {report.reference_data.inkt_records?.length || 0}건</div>
                                                    {report.reference_data.blood_tests?.[0] && (
                                                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                                                            최근 검사일: {report.reference_data.blood_tests[0].test_date}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : "참고된 데이터가 없습니다."}
                                        </div>
                                    </details>

                                    {/* Markdown Content - Explicit Component Mapping */}
                                    <div className="text-gray-800">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-10 mb-4 flex items-center gap-2 text-gray-700" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-8 mb-3 text-gray-600" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-6 mb-2 text-gray-600" {...props} />,
                                                p: ({ node, ...props }) => <p className="text-base leading-relaxed mb-3 text-gray-600" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="mt-0 mb-4 pl-6 list-disc space-y-1 text-gray-600" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="mt-0 mb-4 pl-6 list-decimal space-y-1 text-gray-600" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1 pl-1" {...props} />,
                                                table: ({ node, ...props }) => <div className="overflow-x-auto mt-0 mb-8"><table className="w-full border-collapse border border-gray-200" {...props} /></div>,
                                                thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                                                th: ({ node, ...props }) => <th className="text-left p-4 text-xs font-extrabold text-gray-500 uppercase border-b border-gray-200" {...props} />,
                                                td: ({ node, ...props }) => <td className="p-4 text-sm border-b border-gray-100 text-gray-600" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-extrabold text-gray-700" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-200 pl-4 py-1 my-8 bg-blue-50/50 italic text-gray-500 rounded-r" {...props} />,
                                                a: ({ node, ...props }) => <a className="text-blue-600 hover:underline font-medium" {...props} />,
                                                hr: ({ node, ...props }) => <hr className="my-10 border-gray-100" {...props} />
                                            }}
                                        >
                                            {report.content || ''}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="mt-8 px-4 py-2 bg-gray-100 rounded-full">
                                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                                            * 본 리포트는 AI 보조 분석 결과이며, 의학적 진단을 대신할 수 없습니다. 반드시 주치의와 상담하세요.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </main >

            <LFooter className="mt-12 border-t border-gray-200 bg-white text-gray-600">
                <div className="text-xs text-center text-gray-400">© 2026 I-Eum Platform. All rights reserved.</div>
            </LFooter>

            {/* Upload Modal with BloodTestForm */}
            <LModal open={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="새로운 기록 추가" size="lg">
                <LTabs defaultValue="blood">
                    <LTabsList className="mb-4">
                        <LTabsTrigger value="blood">혈액 검사</LTabsTrigger>
                        <LTabsTrigger value="ct">CT 검사</LTabsTrigger>
                        <LTabsTrigger value="inkt">iNTk 치료</LTabsTrigger>
                    </LTabsList>
                    <LTabsContent value="blood">
                        <div className="max-h-[70vh] overflow-y-auto px-1">
                            <BloodTestForm
                                onSuccess={() => {
                                    setIsUploadModalOpen(false)
                                    router.refresh()
                                }}
                                onCancel={() => setIsUploadModalOpen(false)}
                            />
                        </div>
                    </LTabsContent>
                    <LTabsContent value="ct">
                        <div className="max-h-[70vh] overflow-y-auto px-1">
                            <CTScanForm
                                onSuccess={() => {
                                    setIsUploadModalOpen(false)
                                    router.refresh()
                                }}
                                onCancel={() => setIsUploadModalOpen(false)}
                            />
                        </div>
                    </LTabsContent>
                    <LTabsContent value="inkt">
                        <div className="max-h-[70vh] overflow-y-auto px-1">
                            <InktRecordForm
                                onSuccess={() => {
                                    setIsUploadModalOpen(false)
                                    router.refresh()
                                }}
                                onCancel={() => setIsUploadModalOpen(false)}
                            />
                        </div>
                    </LTabsContent>
                </LTabs>
            </LModal>
        </div >
    )
}
