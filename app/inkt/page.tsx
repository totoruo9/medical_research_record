import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { InktRecordList } from '@/components/inkt-record-list'

export default async function INKtPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: records } = await supabase
        .from('inkt_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('blood_collection_date', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />
            <div className="py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">iNKt 투여 기록</h1>
                        <Link href="/inkt/new">
                            <Button className="gap-2">
                                <PlusCircle className="w-4 h-4" />
                                기록 추가
                            </Button>
                        </Link>
                    </div>

                    <InktRecordList records={records || []} />
                </div>
            </div>
        </div>
    )
}
