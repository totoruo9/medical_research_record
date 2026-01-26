
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { format } from 'date-fns'
import { SiteHeader } from '@/components/site-header'

export default async function CTScansPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: records } = await supabase
        .from('ct_scans')
        .select('*')
        .eq('user_id', user?.id)
        .order('scan_date', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />
            <div className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-200/50 mb-6 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap">CT 판독 기록</h1>
                            <div className="flex w-full sm:w-auto gap-2">
                                <Link href="/ct-scans/new" className="flex-1 sm:flex-none">
                                    <Button className="w-full gap-2">
                                        <PlusCircle className="w-4 h-4" />
                                        기록 추가
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {records?.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
                                기록된 CT 결과가 없습니다.
                            </div>
                        ) : (
                            records?.map((record: any) => (
                                <Card key={record.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between">
                                            <span>{format(new Date(record.scan_date), 'yyyy-MM-dd')}</span>
                                            <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                암 크기: {record.cancer_size || '-'}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <span className="font-semibold text-gray-700">판독 소견:</span>
                                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">{record.interpretation}</p>
                                        </div>
                                        {record.doctor_opinion && (
                                            <div>
                                                <span className="font-semibold text-gray-700">의사 코멘트:</span>
                                                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{record.doctor_opinion}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
