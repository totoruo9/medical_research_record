import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, FileText, Scan, Syringe } from 'lucide-react'

// Helper to normalize data structure
type RecordType = 'blood' | 'ct' | 'inkt' | 'report'

interface UnifiedRecord {
    id: any
    type: RecordType
    date: string
    title: string
    summary: string
    details: any
}

export default async function Option3Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Auth required</div>

    // Fetch all data in parallel
    const [bloodRes, ctRes, inktRes, reportRes] = await Promise.all([
        supabase.from('blood_tests').select('*').eq('user_id', user.id).order('test_date', { ascending: false }),
        supabase.from('ct_scans').select('*').eq('user_id', user.id).order('scan_date', { ascending: false }),
        supabase.from('inkt_records').select('*').eq('user_id', user.id).order('blood_collection_date', { ascending: false }),
        supabase.from('medical_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    const records: UnifiedRecord[] = []

    // Normalize Blood Tests
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

    // Normalize CT Scans
    ctRes.data?.forEach(item => {
        records.push({
            id: item.id,
            type: 'ct',
            date: item.scan_date,
            title: 'CT 촬영',
            summary: `암 크기: ${item.cancer_size || '-'}, 소견: ${item.interpretation?.substring(0, 30)}...`,
            details: item
        })
    })

    // Normalize iNKt
    inktRes.data?.forEach(item => {
        records.push({
            id: item.id,
            type: 'inkt',
            date: item.blood_collection_date, // or injection_date
            title: 'iNKt 치료',
            summary: `투여일: ${item.injection_date || '예정'}, 상태: ${item.status}`,
            details: item
        })
    })

    // Normalize Reports
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

    // Sort by date desc
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Render Helpers
    const getIcon = (type: RecordType) => {
        switch (type) {
            case 'blood': return <Activity className="w-5 h-5 text-red-500" />
            case 'ct': return <Scan className="w-5 h-5 text-blue-500" />
            case 'inkt': return <Syringe className="w-5 h-5 text-green-500" />
            case 'report': return <FileText className="w-5 h-5 text-purple-500" />
        }
    }

    const RecordCard = ({ record }: { record: UnifiedRecord }) => (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className={`p-2 rounded-full bg-gray-100`}>
                    {getIcon(record.type)}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-base font-bold">{record.title}</CardTitle>
                            <CardDescription>{format(new Date(record.date), 'yyyy.MM.dd')}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">{record.type}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="py-2 pb-4 text-sm text-gray-600">
                {record.summary}
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />
            <div className="max-w-4xl mx-auto p-4 py-10 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Option 3: 전체 의료기록 통합 뷰</h1>
                    <p className="text-gray-500">모든 유형의 의료 기록을 한곳에서 모아봅니다.</p>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full justify-start grid grid-cols-5 h-auto p-1 bg-gray-200">
                        <TabsTrigger value="all">전체 ({records.length})</TabsTrigger>
                        <TabsTrigger value="blood">혈액검사</TabsTrigger>
                        <TabsTrigger value="ct">CT</TabsTrigger>
                        <TabsTrigger value="inkt">iNKt</TabsTrigger>
                        <TabsTrigger value="report">리포트</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 mt-4">
                        {records.map(r => <RecordCard key={`${r.type}-${r.id}`} record={r} />)}
                    </TabsContent>

                    {['blood', 'ct', 'inkt', 'report'].map(type => (
                        <TabsContent key={type} value={type} className="space-y-4 mt-4">
                            {records.filter(r => r.type === type).map(r => <RecordCard key={`${r.type}-${r.id}`} record={r} />)}
                            {records.filter(r => r.type === type).length === 0 && (
                                <div className="text-center py-10 text-gray-400">기록이 없습니다.</div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
