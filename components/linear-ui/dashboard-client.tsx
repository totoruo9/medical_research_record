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
    Syringe, Pill
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

type BloodTest = any
type Report = any
type CTScan = any
type InktRecord = any
type UserProfile = { user_metadata: { full_name?: string, avatar_url?: string, email?: string } }

// Helper for status logic (ported from blood-test-list.tsx)
const BLOOD_TEST_RANGES: Record<string, { min: number; max: number; unit: string }> = {
    'ca19_9': { min: 0, max: 37, unit: 'U/mL' },
    'cea': { min: 0, max: 5, unit: 'ng/mL' },
    'wbc': { min: 4, max: 10, unit: '10^3/uL' }, // 4000-10000
    'plt': { min: 150, max: 450, unit: '10^3/uL' }, // 150000-450000
    'neutrophil': { min: 40, max: 75, unit: '%' }, // 40-75%
    'alb': { min: 3.5, max: 5.2, unit: 'g/dL' },
    'protein': { min: 6.0, max: 8.3, unit: 'g/dL' },
    'lymphocyte': { min: 20, max: 45, unit: '%' }
}

function getMetricStatus(key: string, value: number | null) {
    if (value === null || value === undefined) return { status: 'normal' as const, color: 'text-gray-500' }
    const range = BLOOD_TEST_RANGES[key]
    if (!range) return { status: 'normal' as const, color: 'text-gray-500' }

    if (value >= range.min && value <= range.max) return { status: 'normal' as const, color: 'text-green-600' }
    return { status: 'warning' as const, color: 'text-amber-600' }
}

interface LinearDashboardClientProps {
    user: UserProfile
    initialBloodTests: BloodTest[]
    initialReports: Report[]
    initialTimeline: any[] // Mixed types
}

export function LinearDashboardClient({ user, initialBloodTests, initialReports, initialTimeline }: LinearDashboardClientProps) {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [visibleItems, setVisibleItems] = useState(5)
    const router = useRouter()
    const supabase = createClient()

    // Derived Metrics
    const latestTest = initialBloodTests[0]
    const metrics = [
        { key: 'ca19_9', label: 'CA 19-9', value: latestTest?.ca19_9 },
        { key: 'cea', label: 'CEA', value: latestTest?.cea },
        { key: 'wbc', label: 'WBC', value: latestTest?.wbc },
        { key: 'plt', label: 'PLT', value: latestTest?.plt }
    ]

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-gray-50/50" style={{ fontFamily: linearTheme.typography.fontFamily }}>
            {/* Navbar */}
            <LHeader>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">I</div>
                        <span className="text-lg font-bold text-gray-900 tracking-tight">I-Eum</span>
                    </div>
                    <LNav className="hidden md:flex space-x-1">
                        <LNavLink href="#" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</LNavLink>
                        <LNavLink href="#" active={activeTab === 'records'} onClick={() => setActiveTab('records')}>Medical Records</LNavLink>
                        <LNavLink href="#" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')}>AI Analysis</LNavLink>
                    </LNav>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-gray-500 hover:text-gray-700 transition-colors"><Search className="h-5 w-5" /></button>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
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
                            <LButton onClick={() => setIsUploadModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-1.5" /> 기록 추가
                            </LButton>
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
                                            const status = getMetricStatus(m.key, m.value ?? null)
                                            return (
                                                <LCard key={i} hover className="p-4">
                                                    <div className="text-xs text-gray-500 mb-2 font-medium">{m.label}</div>
                                                    <div className="flex items-end gap-1.5">
                                                        <span className={cn("text-2xl font-bold tracking-tight", status.color)}>{m.value ?? '-'}</span>
                                                        <span className="text-xs text-gray-400 mb-1.5">{BLOOD_TEST_RANGES[m.key]?.unit}</span>
                                                    </div>
                                                    <div className={cn("mt-2 flex items-center gap-1 text-[10px] font-medium", status.color)}>
                                                        {status.status === 'normal' ? <><CheckCircle2 className="h-3 w-3" /> 정상 범위</> : <><AlertCircle className="h-3 w-3" /> 주의 필요</>}
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
                                        <LButton variant="ghost" size="sm" onClick={() => setActiveTab('records')} className="text-gray-500">전체 보기 <ChevronRight className="h-3 w-3 ml-1" /></LButton>
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
                                            actions={<LButton size="sm" className="w-full" onClick={() => setActiveTab('analysis')}>전체 리포트 읽기</LButton>}
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

                {/* Records Tab */}
                {
                    activeTab === 'records' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">의료 기록</h2>
                                <LButton onClick={() => setIsUploadModalOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> 기록 추가</LButton>
                            </div>
                            {initialBloodTests.map((test) => (
                                <LExpandableCard
                                    key={test.id}
                                    title={`혈액 검사 - ${test.hospital_name || '병원 미지정'}`}
                                    subtitle={format(new Date(test.test_date), 'yyyy.MM.dd')}
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <LMetricCard label="CA 19-9" value={test.ca19_9 || '-'} status={getMetricStatus('ca19_9', test.ca19_9).status === 'warning' ? 'warning' : 'normal'} />
                                        <LMetricCard label="CEA" value={test.cea || '-'} status={getMetricStatus('cea', test.cea).status === 'warning' ? 'warning' : 'normal'} />
                                        <LMetricCard label="WBC" value={test.wbc || '-'} status={getMetricStatus('wbc', test.wbc).status === 'warning' ? 'warning' : 'normal'} />
                                        <LMetricCard label="PLT" value={test.plt || '-'} status={getMetricStatus('plt', test.plt).status === 'warning' ? 'warning' : 'normal'} />
                                    </div>
                                </LExpandableCard>
                            ))}
                        </div>
                    )
                }

                {/* Analysis Tab */}
                {
                    activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">AI 분석 리포트</h2>
                            {initialReports.map((report) => (
                                <LCard key={report.id}>
                                    <LCardHeader><LCardTitle>{format(new Date(report.created_at), 'yyyy.MM.dd')} 리포트</LCardTitle></LCardHeader>
                                    <LCardContent>
                                        <div className="prose prose-sm max-w-none text-gray-700">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content || ''}</ReactMarkdown>
                                        </div>
                                    </LCardContent>
                                </LCard>
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
