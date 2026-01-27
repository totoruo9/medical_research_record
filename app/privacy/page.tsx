
import { SiteHeader } from "@/components/site-header"

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
                    <div className="border-b pb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
                        <p className="text-gray-500">최종 수정일: 2026년 1월 27일</p>
                    </div>

                    <div className="prose prose-gray max-w-none space-y-6">
                        <p>
                            <strong>Care Platform</strong>(이하 "회사" 또는 "서비스")은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 소중하게 생각합니다. 본 개인정보처리방침은 회사가 이용자의 개인정보를 어떻게 수집, 이용, 보관 및 파기하는지에 대해 설명합니다.
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 수집하는 개인정보의 항목 및 수집 방법</h2>
                            <p className="mb-2">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                <li><strong>필수 수집 항목 (Google 로그인 연동):</strong> 이름, 이메일 주소, 프로필 사진 URL</li>
                                <li><strong>서비스 이용 과정에서 생성/수집되는 정보:</strong> 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                                <li><strong>건강 관련 민감 정보 (이용자 선택 및 입력 시):</strong> 혈액 검사 결과, CT 판독 기록, iNKt 투여 기록 등 건강 상태 모니터링 및 AI 분석을 위해 사용자가 직접 제공하는 데이터</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
                            <p className="mb-2">수집한 개인정보는 다음의 목적을 위해서만 이용됩니다.</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                <li>회원 가입 및 관리 (본인 확인, 서비스 부정 이용 방지)</li>
                                <li>AI 기반 건강 데이터 분석 및 리포트 제공</li>
                                <li>서비스 개선 및 신규 서비스 개발</li>
                                <li>문의 사항 처리 및 공지사항 전달</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
                            <p className="mb-2">회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보는 명시한 기간 동안 보존합니다.</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                <li>회원 가입 정보: <strong>회원 탈퇴 시까지</strong> (단, 관계 법령 위반에 따른 수사/조사 등이 진행 중인 경우에는 종료 시까지)</li>
                                <li>서비스 이용 기록: 통신비밀보호법에 따라 3개월간 보관</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
                            <p className="mb-2">회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 서비스 제공을 위해 다음과 같은 경우 예외로 합니다.</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                <li><strong>AI 분석을 위한 데이터 처리:</strong> 사용자가 입력한 비식별화된 건강 데이터가 AI 모델(OpenAI 등) 처리를 위해 전송될 수 있습니다. (개인 식별 정보 제외)</li>
                                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 이용자의 권리</h2>
                            <p className="mb-2">이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 수집/이용에 대한 동의 철회 또는 가입 해지를 요청할 수 있습니다. 개인정보 조회 및 수정은 사이트 내 '설정' 메뉴에서 가능합니다.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 개인정보 보호책임자 및 담당부서</h2>
                            <p className="mb-2">서비스 이용 중 발생하는 모든 개인정보보호 관련 민원은 아래로 연락 주시기 바랍니다.</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                <li><strong>이메일:</strong> support@care-platform.example.com</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
