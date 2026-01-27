import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { TimelineFeed, UnifiedRecord } from '@/components/experiments/timeline-feed'

export default async function Option4Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Auth required</div>

    // Fetch all data
    const [bloodRes, ctRes, inktRes, reportRes] = await Promise.all([
        supabase.from('blood_tests').select('*').eq('user_id', user.id).order('test_date', { ascending: false }),
        supabase.from('ct_scans').select('*').eq('user_id', user.id).order('scan_date', { ascending: false }),
        supabase.from('inkt_records').select('*').eq('user_id', user.id).order('blood_collection_date', { ascending: false }),
        supabase.from('ai_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    const records: UnifiedRecord[] = []

    bloodRes.data?.forEach(item => {
        records.push({
            id: item.id,
            type: 'blood',
            date: item.test_date,
            title: '혈액 검사',
            summary: `CA19-9: ${item.ca_19_9 || '-'}, CEA: ${item.cea || '-'}`,
            details: item
        })
    })
    ctRes.data?.forEach(item => {
        records.push({
            id: item.id,
            type: 'ct',
            date: item.scan_date,
            title: 'CT 촬영',
            summary: `암 크기: ${item.cancer_size || '-'}`,
            details: item
        })
    })
    inktRes.data?.forEach(item => {
        records.push({
            id: item.id,
            type: 'inkt',
            date: item.blood_collection_date,
            title: 'iNKt 치료',
            summary: item.second_admin_date ? '2회차 투여 완료' : (item.first_admin_date ? '1회차 투여 완료' : '채혈 완료 (투여 대기)'),
            details: item
        })
    })
    reportRes.data?.forEach(item => {
        records.push({
            id: item.id,
            type: 'report',
            date: item.created_at,
            title: 'AI 분석 리포트',
            summary: '종합 건강 상세 분석 리포트',
            details: item
        })
    })

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />
            <div className="max-w-3xl mx-auto p-4 py-10">
                <div className="mb-10 text-center space-y-2">
                    <h1 className="text-2xl font-bold">전체 의료 기록 (Timeline)</h1>
                    <p className="text-gray-500">카드를 탭하여 상세 내용을 확인하세요.</p>
                </div>

                <TimelineFeed records={records} />
            </div>
        </div>
    )
}
