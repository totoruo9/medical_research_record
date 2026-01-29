'use client'

import React, { useState } from 'react'
import {
    LButton, LBadge, LCard, LCardHeader, LCardContent, LCardTitle, LCardFooter,
    LAlert, LInput, LAvatar, LHeader, LNav, LNavLink, LMetricCard, LEmptyState,
    LImageCard, LDropdown, LDropdownItem, LExpandableCard,
    LFooter, LFooterSection, LFooterLink,
    LHero, LHeroTitle, LHeroSubtitle, LProfile, LModal, LModalFooter, linearTheme, LThemeToggle,
    LTimeline, LTimelineDate, LTimelineItem, LTimelineIcon, LTimelineContent
} from '@/components/linear-ui'
import { Home, Activity, FileText, Brain, Settings, ChevronDown, Download, CheckCircle2, AlertTriangle, AlertCircle, Info, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react'

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <section className="mb-14">
            <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
            {desc && <p className="text-sm text-muted-foreground mb-5">{desc}</p>}
            {children}
        </section>
    )
}

export default function LinearComponentsPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalSize, setModalSize] = useState<'sm' | 'default' | 'lg'>('default')
    return (
        <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: linearTheme.typography.fontFamily }}>
            {/* Header */}
            <LHeader>
                <div className="flex items-center gap-8">
                    <span className="text-lg font-bold text-foreground">Linear UI</span>
                    <LNav className="hidden md:flex">
                        <LNavLink href="#" active>Components</LNavLink>
                        <LNavLink href="#">Tokens</LNavLink>
                        <LNavLink href="#">Examples</LNavLink>
                    </LNav>
                </div>
                <div className="flex items-center gap-4">
                    <LThemeToggle />
                    <LProfile name="홍길동" email="user@example.com" onLogout={() => alert('Logout')} />
                </div>
            </LHeader>

            {/* Hero Sections */}
            <LHero variant="default" className="bg-muted/30">
                <LHeroTitle className="text-foreground">Linear UI Component Library</LHeroTitle>
                <LHeroSubtitle className="text-muted-foreground">Linear Careers 디자인 시스템 기반 컴포넌트</LHeroSubtitle>
                <div className="mt-8 flex gap-3 justify-center">
                    <LButton size="lg">시작하기</LButton>
                    <LButton variant="secondary" size="lg">문서 보기</LButton>
                </div>
            </LHero>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Hero Variants */}
                <Section title="Hero Section" desc="히어로 섹션 변형">
                    <div className="space-y-6">
                        <LHero variant="gradient" className="rounded-md">
                            <LHeroTitle>Gradient Hero</LHeroTitle>
                            <LHeroSubtitle>그라데이션 배경의 히어로 섹션</LHeroSubtitle>
                            <div className="mt-6 flex gap-3 justify-center">
                                <LButton className="bg-background text-foreground hover:bg-muted">시작하기</LButton>
                                <LButton variant="ghost" className="text-white border border-white/30 hover:bg-white/10">더 알아보기</LButton>
                            </div>
                        </LHero>
                    </div>
                </Section>

                {/* Colors */}
                <Section title="Colors" desc="디자인 시스템 색상 팔레트">
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                        {[
                            { name: "900", color: linearTheme.colors.gray[900] },
                            { name: "700", color: linearTheme.colors.gray[700] },
                            { name: "500", color: linearTheme.colors.gray[500] },
                            { name: "300", color: linearTheme.colors.gray[300] },
                            { name: "Blue", color: linearTheme.colors.accent.blue },
                            { name: "Purple", color: linearTheme.colors.accent.purple },
                            { name: "Success", color: linearTheme.colors.state.success },
                            { name: "Error", color: linearTheme.colors.state.error },
                        ].map((c) => (
                            <div key={c.name} className="text-center">
                                <div className="h-12 rounded mb-1.5" style={{ backgroundColor: c.color }} />
                                <span className="text-[10px] font-medium text-gray-500">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Buttons */}
                <Section title="Buttons" desc="버튼 스타일 변형">
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <LButton>Default</LButton>
                            <LButton variant="secondary">Secondary</LButton>
                            <LButton variant="ghost">Ghost</LButton>
                            <LButton variant="outline">Outline</LButton>
                            <LButton variant="danger">Danger</LButton>
                            <LButton variant="link">Link</LButton>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <LButton size="xs">XS</LButton>
                            <LButton size="sm">SM</LButton>
                            <LButton size="default">Default</LButton>
                            <LButton size="lg">Large</LButton>
                            <LButton size="icon"><Settings className="h-4 w-4" /></LButton>
                        </div>
                    </div>
                </Section>

                {/* Badges */}
                <Section title="Badges" desc="상태 배지">
                    <div className="flex flex-wrap gap-2">
                        <LBadge>Default</LBadge>
                        <LBadge variant="success">Success</LBadge>
                        <LBadge variant="warning">Warning</LBadge>
                        <LBadge variant="error">Error</LBadge>
                        <LBadge variant="info">Info</LBadge>
                        <LBadge variant="purple">Purple</LBadge>
                    </div>
                </Section>

                {/* Cards */}
                <Section title="Cards" desc="카드 컴포넌트 변형">
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Basic Card */}
                        <LCard>
                            <LCardHeader><LCardTitle>기본 카드</LCardTitle></LCardHeader>
                            <LCardContent><p className="text-sm text-muted-foreground">카드 컨텐츠 영역</p></LCardContent>
                        </LCard>
                        {/* Card with Button */}
                        <LCard>
                            <LCardHeader><LCardTitle>버튼 포함</LCardTitle></LCardHeader>
                            <LCardContent><p className="text-sm text-muted-foreground">액션 버튼이 있는 카드</p></LCardContent>
                            <LCardFooter><LButton size="sm">자세히 보기</LButton></LCardFooter>
                        </LCard>
                        {/* Card with Hover */}
                        <LCard hover>
                            <LCardHeader><LCardTitle>호버 효과</LCardTitle></LCardHeader>
                            <LCardContent><p className="text-sm text-muted-foreground">마우스 호버 시 효과</p></LCardContent>
                        </LCard>
                    </div>
                </Section>

                {/* Cards with Footer Buttons */}
                <Section title="Card with Footer" desc="카드 내부 푸터 버튼">
                    <div className="grid md:grid-cols-2 gap-4">
                        <LCard>
                            <LCardContent className="pb-0">
                                <h3 className="font-semibold text-foreground mb-2">데이터 삭제</h3>
                                <p className="text-sm text-muted-foreground">이 작업은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?</p>
                            </LCardContent>
                            <div className="flex justify-end gap-2 p-4 border-t border-border mt-4">
                                <LButton variant="ghost" size="sm">취소</LButton>
                                <LButton variant="danger" size="sm">삭제</LButton>
                            </div>
                        </LCard>
                        <LCard>
                            <LCardContent className="pb-0">
                                <h3 className="font-semibold text-foreground mb-2">새 프로젝트</h3>
                                <p className="text-sm text-muted-foreground mb-3">프로젝트 이름을 입력하세요.</p>
                                <LInput placeholder="프로젝트 이름" />
                            </LCardContent>
                            <div className="flex justify-end gap-2 p-4 border-t border-border mt-4">
                                <LButton variant="secondary" size="sm">취소</LButton>
                                <LButton size="sm">생성</LButton>
                            </div>
                        </LCard>
                        {/* Dialog-style Card */}
                        <LCard className="overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <h3 className="font-semibold text-foreground">모달 제목</h3>
                                <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">✕</button>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-muted-foreground mb-4">모달 콘텐츠가 여기에 표시됩니다.</p>
                                <LInput label="이름" placeholder="입력하세요" />
                            </div>
                            <div className="flex justify-end gap-2 px-4 py-3 bg-muted/30 border-t border-border">
                                <LButton variant="ghost" size="sm">취소</LButton>
                                <LButton size="sm">확인</LButton>
                            </div>
                        </LCard>
                    </div>
                </Section>

                {/* Image Cards */}
                <Section title="Image Cards" desc="이미지 포함 카드">
                    <div className="grid md:grid-cols-3 gap-4">
                        <LImageCard
                            imageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
                            title="프로젝트 관리"
                            description="팀의 모든 프로젝트를 한눈에"
                            tag="신규"
                        />
                        <LImageCard
                            imageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
                            title="데이터 분석"
                            description="실시간 차트와 리포트"
                            actions={<LButton size="sm">자세히 보기</LButton>}
                        />
                        <LImageCard
                            imageSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop"
                            title="팀 협업"
                            description="원활한 커뮤니케이션"
                        />
                    </div>
                </Section>

                {/* Expandable Cards */}
                <Section title="Expandable Cards" desc="펼침/접기 카드 (수정/삭제 기능)">
                    <div className="space-y-3">
                        <LExpandableCard
                            title="2026.01.28 혈액 검사"
                            subtitle="CA19-9: 20, CEA: 5"
                            onEdit={() => alert('Edit')}
                            onDelete={() => alert('Delete')}
                            defaultOpen
                        >
                            <div className="grid grid-cols-4 gap-4">
                                <LMetricCard label="CA 19-9" value="20" status="normal" />
                                <LMetricCard label="CEA" value="5" status="normal" />
                                <LMetricCard label="WBC" value="11.5" status="warning" />
                                <LMetricCard label="PLT" value="75" status="danger" />
                            </div>
                        </LExpandableCard>
                        <LExpandableCard
                            title="2026.01.15 혈액 검사"
                            subtitle="CA19-9: 25, CEA: 6"
                            onEdit={() => alert('Edit')}
                            onDelete={() => alert('Delete')}
                        >
                            <p className="text-sm text-muted-foreground">상세 내용이 표시됩니다.</p>
                        </LExpandableCard>
                    </div>
                </Section>

                {/* Dropdown */}
                <Section title="Dropdown" desc="드롭다운 메뉴">
                    <div className="flex gap-4">
                        <LDropdown trigger={<LButton variant="secondary">메뉴 열기 <ChevronDown className="h-4 w-4" /></LButton>}>
                            <LDropdownItem><Edit2 className="h-3.5 w-3.5" />수정</LDropdownItem>
                            <LDropdownItem><Download className="h-3.5 w-3.5" />다운로드</LDropdownItem>
                            <LDropdownItem danger><Trash2 className="h-3.5 w-3.5" />삭제</LDropdownItem>
                        </LDropdown>
                    </div>
                </Section>

                {/* Alerts */}
                <Section title="Alerts" desc="알림 메시지">
                    <div className="space-y-2">
                        <LAlert variant="info"><Info className="h-4 w-4 shrink-0 mt-0.5" /><span>정보성 알림 메시지</span></LAlert>
                        <LAlert variant="success"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /><span>성공 메시지</span></LAlert>
                        <LAlert variant="warning"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /><span>경고 메시지</span></LAlert>
                        <LAlert variant="error"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>오류 메시지</span></LAlert>
                    </div>
                </Section>

                {/* Inputs */}
                <Section title="Inputs" desc="입력 필드">
                    <div className="max-w-sm space-y-3">
                        <LInput label="이름" placeholder="홍길동" />
                        <LInput label="이메일" type="email" placeholder="email@example.com" />
                        <LInput label="오류 상태" error="필수 입력 항목입니다." />
                        <LInput label="비활성화" placeholder="수정 불가" disabled />
                    </div>
                </Section>

                {/* Modal / Popup */}
                <Section title="Modal / Popup" desc="팝업 다이얼로그">
                    <div className="flex gap-3">
                        <LButton variant="secondary" onClick={() => { setModalSize('sm'); setModalOpen(true) }}>Small Modal</LButton>
                        <LButton variant="secondary" onClick={() => { setModalSize('default'); setModalOpen(true) }}>Default Modal</LButton>
                        <LButton variant="secondary" onClick={() => { setModalSize('lg'); setModalOpen(true) }}>Large Modal</LButton>
                    </div>
                    <LModal open={modalOpen} onClose={() => setModalOpen(false)} title="모달 제목" size={modalSize}>
                        <p className="text-sm text-muted-foreground mb-4">모달 콘텐츠가 여기에 표시됩니다.</p>
                        <LInput label="이름" placeholder="입력하세요" />
                        <LModalFooter className="-mx-4 -mb-4 mt-4">
                            <LButton variant="ghost" onClick={() => setModalOpen(false)}>취소</LButton>
                            <LButton onClick={() => setModalOpen(false)}>확인</LButton>
                        </LModalFooter>
                    </LModal>
                </Section>

                {/* Avatars */}
                <Section title="Avatars" desc="사용자 아바타">
                    <div className="flex items-center gap-3">
                        <LAvatar name="홍길동" size="sm" />
                        <LAvatar name="김철수" size="default" />
                        <LAvatar name="이영희" size="lg" />
                    </div>
                </Section>

                {/* Profile */}
                <Section title="Profile Dropdown" desc="프로필 드롭다운">
                    <LProfile name="홍길동" email="hong@example.com" onLogout={() => alert('Logout')} />
                </Section>

                {/* Shadows */}
                <Section title="Shadows" desc="그림자 스타일">
                    <div className="flex gap-6">
                        {Object.entries(linearTheme.shadows).map(([name, shadow]) => (
                            <div key={name} className="text-center">
                                <div className="h-16 w-16 bg-card rounded mb-2" style={{ boxShadow: shadow }} />
                                <span className="text-[10px] font-medium text-muted-foreground">{name}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Radius */}
                <Section title="Radius" desc="모서리 둥글기">
                    <div className="flex flex-wrap gap-6 items-end">
                        {[
                            { name: "sm", class: "rounded-sm" },
                            { name: "md", class: "rounded-md" },
                            { name: "lg", class: "rounded-lg" },
                            { name: "xl", class: "rounded-xl" },
                            { name: "2xl", class: "rounded-2xl" },
                            { name: "3xl", class: "rounded-3xl" },
                            { name: "full", class: "rounded-full" },
                        ].map((r) => (
                            <div key={r.name} className="text-center">
                                <div className={`h-16 w-16 bg-accent border border-border mb-2 ${r.class}`} />
                                <span className="text-xs font-medium text-muted-foreground">rounded-{r.name}</span>
                            </div>
                        ))}
                    </div>
                </Section>
                {/* Timeline */}
                <Section title="Timeline" desc="타임라인 (활동 내역)">
                    <LTimeline>
                        <LTimelineDate>2026년 08월</LTimelineDate>
                        <LTimelineItem>
                            <LTimelineIcon variant="danger"><Activity className="h-5 w-5" /></LTimelineIcon>
                            <LTimelineContent>
                                <LExpandableCard title="혈액 검사" subtitle="08월 24일 (월) • 주요 수치 안정적" className="mb-6 shadow-sm border-gray-100">
                                    <p className="text-sm text-muted-foreground">상세 검사 결과 내용입니다.</p>
                                </LExpandableCard>
                            </LTimelineContent>
                        </LTimelineItem>
                        <LTimelineItem>
                            <LTimelineIcon variant="success"><Settings className="h-5 w-5" /></LTimelineIcon>
                            <LTimelineContent>
                                <LExpandableCard title="iNTk 치료" subtitle="08월 20일 (목) • 3회차 투여 완료" className="mb-6 shadow-sm border-gray-100">
                                    <p className="text-sm text-muted-foreground">특이사항 없음.</p>
                                </LExpandableCard>
                            </LTimelineContent>
                        </LTimelineItem>
                        <LTimelineDate>2026년 07월</LTimelineDate>
                        <LTimelineItem>
                            <LTimelineIcon variant="default"><FileText className="h-5 w-5" /></LTimelineIcon>
                            <LTimelineContent>
                                <LExpandableCard title="모니터링 리포트" subtitle="07월 15일 (수) • 월간 분석 완료" className="mb-6 shadow-sm border-gray-100">
                                    <p className="text-sm text-muted-foreground">리포트 내용 요약.</p>
                                </LExpandableCard>
                            </LTimelineContent>
                        </LTimelineItem>
                    </LTimeline>
                </Section>
            </main>

            {/* Footer */}
            <LFooter>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <LFooterSection title="Product">
                        <LFooterLink href="#">Features</LFooterLink>
                        <LFooterLink href="#">Pricing</LFooterLink>
                        <LFooterLink href="#">Changelog</LFooterLink>
                    </LFooterSection>
                    <LFooterSection title="Company">
                        <LFooterLink href="#">About</LFooterLink>
                        <LFooterLink href="#">Blog</LFooterLink>
                        <LFooterLink href="#">Careers</LFooterLink>
                    </LFooterSection>
                    <LFooterSection title="Resources">
                        <LFooterLink href="#">Documentation</LFooterLink>
                        <LFooterLink href="#">API</LFooterLink>
                        <LFooterLink href="#">Status</LFooterLink>
                    </LFooterSection>
                    <LFooterSection title="Legal">
                        <LFooterLink href="#">Privacy</LFooterLink>
                        <LFooterLink href="#">Terms</LFooterLink>
                    </LFooterSection>
                </div>
                <div className="mt-10 pt-6 border-t border-gray-800 text-sm">
                    © 2026 Linear UI. All rights reserved.
                </div>
            </LFooter>
        </div>
    )
}
