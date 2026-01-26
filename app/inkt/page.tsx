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
            <div className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-200/50 mb-6 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap">iNKt 투여 기록</h1>
                            <div className="flex w-full sm:w-auto gap-2">
                                <Link href="/inkt/new" className="flex-1 sm:flex-none">
                                    <Button className="w-full gap-2">
                                        <PlusCircle className="w-4 h-4" />
                                        기록 추가
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <InktRecordList records={records || []} />
                </div>
            </div>
        </div>
    )
}
