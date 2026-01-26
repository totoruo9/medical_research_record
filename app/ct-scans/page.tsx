
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
            <div className="py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">CT 판독 기록</h1>
                        <Link href="/ct-scans/new">
                            <Button className="gap-2">
                                <PlusCircle className="w-4 h-4" />
                                기록 추가
                            </Button>
                        </Link>
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
