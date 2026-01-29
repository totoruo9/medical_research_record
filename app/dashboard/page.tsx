
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/linear-ui/dashboard-client'
import { SiteHeader } from '@/components/site-header'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Data
    const { data: bloodTests } = await supabase
        .from('blood_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false })

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

    const { data: aiReports } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Construct Timeline
    const timeline = [
        ...(bloodTests?.map((item: any) => ({ ...item, type: 'blood_test', date: item.test_date, details: item })) || []),
        ...(ctScans?.map((item: any) => ({ ...item, type: 'ct_scan', date: item.scan_date, details: item })) || []),
        ...(inktRecords?.map((item: any) => ({ ...item, type: 'inkt', date: item.blood_collection_date, details: item })) || []),
        ...(aiReports?.map((item: any) => ({ ...item, type: 'ai_report', date: item.created_at, details: item })) || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />

            <div className="py-10">
                <main>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <DashboardClient
                            user={user}
                            initialBloodTests={bloodTests || []}
                            initialTimeline={timeline}
                            initialReports={aiReports || []}
                        />
                    </div>
                </main>
            </div>
        </div>
    )
}
