
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ReportItem } from '@/components/report-item'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>로그인이 필요합니다.</div>
    }

    const { data: reports } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />
            <div className="py-6 md:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-200/50 mb-6 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap">지난 AI 정밀 분석 기록</h1>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {!reports || reports.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
                                생성된 분석 리포트가 없습니다.
                            </div>
                        ) : (
                            reports.map((report) => (
                                <ReportItem key={report.id} report={report} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
