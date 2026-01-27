
import { SiteHeader } from "@/components/site-header"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <Link href="/login">
                        <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-gray-900">
                            <ArrowLeft className="h-4 w-4" />
                            뒤로가기
                        </Button>
                    </Link>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
                    <div className="border-b pb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 이용약관</h1>
                        <p className="text-gray-500">최종 수정일: 2026년 1월 27일</p>
                    </div>

                    <div className="prose prose-gray max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 목적</h2>
                            <p>
                                본 약관은 <strong>이음 (I-Eum)</strong>(이하 "회사" 또는 "서비스")이 제공하는 제반 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 용어의 정의</h2>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                <li>"서비스"란 단말기(PC, 휴대형단말기 등 각종 유무선 장치를 포함)에 상관없이 회원이 이용할 수 있는 이음 (I-Eum) 및 관련 제반 서비스를 의미합니다.</li>
                                <li>"회원"이라 함은 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
                            </ul>
                        </section>

                        <section className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <h2 className="text-xl font-semibold text-red-800 mb-3">3. 의학적 자문에 대한 면책 (중요)</h2>
                            <p className="text-red-700 font-medium mb-2">
                                본 서비스가 제공하는 모든 데이터, 분석 결과 및 정보는 보조적인 참고 자료일 뿐이며, 전문적인 의학적 진단, 소견, 치료를 대체할 수 없습니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-red-700">
                                <li>사용자는 본 서비스의 정보에 전적으로 의존해서는 안 되며, 건강 상태에 대한 확정적인 진단이나 치료 결정은 반드시 전문 의료진과 상의해야 합니다.</li>
                                <li>회사는 사용자가 서비스에 게재된 정보만을 신뢰하여 발생한 결과에 대해 어떠한 법적 책임도 지지 않습니다.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 이용계약의 성립</h2>
                            <p>
                                이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다. 구글 계정 연동(Social Login)을 통해 가입하는 경우, 해당 인증 과정 완료 시 약관 동의 및 이용계약 체결로 간주합니다.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 회원의 의무</h2>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                <li>회원은 회원가입 신청 또는 회원정보 변경 시 모든 사항을 사실에 근거하여 작성하여야 합니다.</li>
                                <li>회원은 본인의 계정 정보를 본인만이 사용하도록 관리해야 하며, 타인에게 양도하거나 대여해서는 안 됩니다.</li>
                                <li>회원은 관계 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 합니다.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 서비스의 제공 및 변경</h2>
                            <p>
                                회사는 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경하거나 중단할 수 있으며, 이에 대하여 관련 법령에 특별한 규정이 없는 한 회원에게 별도의 보상을 하지 않습니다.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 책임의 한계</h2>
                            <p>
                                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 또한 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
