'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { deleteInktRecord } from '@/lib/actions/inkt'
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InktRecordForm } from './inkt-record-form'

interface InktRecordListProps {
    records: any[]
}

export function InktRecordList({ records: initialRecords }: InktRecordListProps) {
    const [records, setRecords] = useState(initialRecords)
    const [editingId, setEditingId] = useState<number | null>(null)

    const handleDelete = async (id: number) => {
        if (confirm('정말 이 기록을 삭제하시겠습니까?')) {
            await deleteInktRecord(id)
            setRecords(records.filter(r => r.id !== id))
        }
    }

    const handleSuccess = () => {
        setEditingId(null)
        // Ideally re-fetch or rely on Next.js server action revalidation + router.refresh
        // For simplicity, we trigger a full reload or use router.refresh() if passed as prop
        window.location.reload()
    }

    return (
        <div className="grid gap-4">
            {records.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
                    기록된 데이터가 없습니다.
                </div>
            ) : (
                records.map((record) => (
                    <Card key={record.id} className="transition-all hover:shadow-md">
                        {editingId === record.id ? (
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Edit2 className="w-5 h-5" /> 기록 수정
                                </h3>
                                <InktRecordForm
                                    initialData={record}
                                    onSuccess={handleSuccess}
                                    onCancel={() => setEditingId(null)}
                                />
                            </div>
                        ) : (
                            <>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle>
                                        채혈일: {format(new Date(record.blood_collection_date), 'yyyy.MM.dd')}
                                    </CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">메뉴 열기</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingId(record.id)}>
                                                <Edit2 className="mr-2 h-4 w-4" /> 수정
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(record.id)} className="text-red-600 focus:text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <span className="font-semibold text-gray-700 block">1회차 투여:</span>
                                            {record.first_admin_date ? format(new Date(record.first_admin_date), 'yyyy.MM.dd') : '-'}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700 block">2회차 투여:</span>
                                            {record.second_admin_date ? format(new Date(record.second_admin_date), 'yyyy.MM.dd') : '-'}
                                        </div>
                                    </div>
                                    {record.notes && (
                                        <div className="bg-rose-50 p-3 rounded-md text-sm text-gray-700 mt-2 border border-rose-100">
                                            <span className="font-bold text-rose-700 block mb-1">⚠️ 특이사항:</span>
                                            {record.notes}
                                        </div>
                                    )}
                                    {record.treatment_effect && (
                                        <div className="bg-emerald-50 p-3 rounded-md text-sm text-gray-700 mt-2 border border-emerald-100">
                                            <span className="font-bold text-emerald-700 block mb-1">✨ 치료 효과:</span>
                                            {record.treatment_effect}
                                        </div>
                                    )}
                                </CardContent>
                            </>
                        )}
                    </Card>
                ))
            )}
        </div>
    )
}
