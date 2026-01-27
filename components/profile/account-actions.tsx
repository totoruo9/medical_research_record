'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteAccount } from "@/lib/actions/patient"
import { ExternalLink, LogOut, Trash2 } from "lucide-react"
import Link from "next/link"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AccountActions() {
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>법적 고지 및 약관</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-between" asChild>
                        <Link href="/terms">
                            서비스 이용약관
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                        </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-between" asChild>
                        <Link href="/privacy">
                            개인정보 처리방침
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-700">계정 관리</CardTitle>
                    <CardDescription>
                        계정 로그아웃 및 탈퇴 기능을 제공합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none">
                                <Trash2 className="w-4 h-4 mr-2" />
                                회원 탈퇴 (계정 삭제)
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    탈퇴 시 모든 의료 기록과 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
                                    연결된 보호자 계정에서의 접근도 모두 차단됩니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteAccount()}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    탈퇴 및 데이터 삭제
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    )
}
