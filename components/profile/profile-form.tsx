'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updatePatientProfile } from "@/lib/actions/patient"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfileFormProps {
    initialData: any
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)


    async function onSubmit(formData: FormData) {
        setLoading(true)
        try {
            await updatePatientProfile(formData)
            toast.success("저장 완료", {
                description: "환자 정보가 성공적으로 업데이트되었습니다.",
            })
        } catch (error: any) {
            toast.error("저장 실패", {
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>환자 의료 정보</CardTitle>
                <CardDescription>
                    응급 상황이나 AI 분석 시 활용될 수 있는 의료 정보입니다.
                </CardDescription>
            </CardHeader>
            <form action={onSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">환자 성함</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={initialData?.name || ''}
                            placeholder="환자분 성함을 입력하세요"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="diagnosis">진단명 (기수)</Label>
                        <Input
                            id="diagnosis"
                            name="diagnosis"
                            defaultValue={initialData?.diagnosis || ''}
                            placeholder="예: 췌장암 2기"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="hospital">주 이용 병원</Label>
                            <Input
                                id="hospital"
                                name="hospital"
                                defaultValue={initialData?.hospital_name || ''}
                                placeholder="예: 서울아산병원"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="doctor">주치의 선생님</Label>
                            <Input
                                id="doctor"
                                name="doctor"
                                defaultValue={initialData?.primary_doctor || ''}
                                placeholder="성함을 입력하세요"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-gray-50/50 flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        저장하기
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
