import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LinearDashboardClient } from '@/components/linear-ui/dashboard-client'

export default async function LinearRedesignPage() {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch Data
    const { data: bloodTests } = await supabase
        .from('blood_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false })

    const { data: reports } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const { data: ctScans } = await supabase
        .from('ct_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('scan_date', { ascending: false })

    const { data: inktRecords } = await supabase
        .from('inkt_records')
        .select('*')
        .eq('user_id', user.id)
        .order('blood_collection_date', { ascending: false })

    // 3. Combine Timeline
    const timeline = [
        ...(bloodTests || []).map((t: any) => ({
            id: `bt-${t.id}`, type: 'blood_test', date: t.test_date,
            summary: `CA 19-9: ${t.ca19_9}, CEA: ${t.cea}`, details: t
        })),
        ...(reports || []).map((r: any) => ({
            id: `rep-${r.id}`, type: 'ai_report', date: r.created_at,
            summary: 'AI 분석 리포트', details: r.content
        })),
        ...(ctScans || []).map((c: any) => ({
            id: `ct-${c.id}`, type: 'ct_scan', date: c.scan_date,
            summary: c.result_summary || 'CT 검사 기록', details: c.findings
        })),
        ...(inktRecords || []).map((i: any) => ({
            id: `inkt-${i.id}`, type: 'inkt', date: i.blood_collection_date,
            summary: `iNTk 치료 기록`, details: i
        }))
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <LinearDashboardClient
            user={user}
            initialBloodTests={bloodTests || []}
            initialReports={reports || []}
            initialTimeline={timeline}
        />
    )
}
