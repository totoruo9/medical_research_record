'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createInviteCode, removeCareTeamMember } from "@/lib/actions/patient"
import { Copy, Mail, MessageSquare, Trash2, UserPlus, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface FamilyManagerProps {
    initialMembers: any[]
    userRole: string
    inviteCode?: string
}

export function FamilyManager({ initialMembers, userRole, inviteCode: initialCode }: FamilyManagerProps) {
    const [code, setCode] = useState<string | null>(initialCode || null)
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState(initialMembers)

    const handleGenerateCode = async () => {
        setLoading(true)
        try {
            const newCode = await createInviteCode()
            setCode(newCode)
        } catch (error) {
            toast.error("오류 발생", {
                description: "초대 코드를 생성하지 못했습니다.",
            })
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!code) return
        navigator.clipboard.writeText(code)
        toast.success("복사 완료", {
            description: "초대 코드가 클립보드에 복사되었습니다.",
        })
    }

    const shareBody = `[이음] 췌장암 케어 플랫폼 초대\n\n환자분의 의료 기록 관리를 함께해주세요.\n초대 코드: ${code}\n\n앱에서 '보호자 연동'을 선택하고 위 코드를 입력하세요.`
    const shareSubject = "[이음] 가족 보호자 초대"

    const handleRemoveMember = async (memberId: string) => {
        try {
            await removeCareTeamMember(memberId)
            setMembers(members.filter(m => m.id !== memberId))
            toast.success("삭제 완료", {
                description: "보호자 연결이 해제되었습니다.",
            })
        } catch (error: any) {
            toast.error("삭제 실패", {
                description: error.message,
            })
        }
    }


    const [recipientPhone, setRecipientPhone] = useState("")
    const [recipientEmail, setRecipientEmail] = useState("")
    const [smsOpen, setSmsOpen] = useState(false)
    const [emailOpen, setEmailOpen] = useState(false)
    const [smsStep, setSmsStep] = useState<'input' | 'sent'>('input')
    const [emailStep, setEmailStep] = useState<'input' | 'sent'>('input')

    // Reset steps when dialogs close
    const handleSmsOpenChange = (open: boolean) => {
        setSmsOpen(open)
        if (!open) setTimeout(() => setSmsStep('input'), 300)
    }

    const handleEmailOpenChange = (open: boolean) => {
        setEmailOpen(open)
        if (!open) setTimeout(() => setEmailStep('input'), 300)
    }

    const handleSendSMS = () => {
        if (!recipientPhone) return
        const link = `sms:${recipientPhone}?body=${encodeURIComponent(shareBody)}`
        window.location.href = link
        setSmsStep('sent')
    }

    const handleSendEmail = () => {
        if (!recipientEmail) return
        const link = `mailto:${recipientEmail}?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`
        window.location.href = link
        setEmailStep('sent')
    }

    const handleInviteComplete = () => {
        setSmsOpen(false)
        setEmailOpen(false)
        toast.success("초대 발송 완료", {
            description: "가족이 초대 코드를 입력하면 목록에 나타납니다.",
        })
    }

    const isOwner = userRole === 'owner'

    return (
        <div className="space-y-6">
            {/* 1. Invite Section (Only for Owners) */}
            {isOwner && (
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <UserPlus className="w-5 h-5" />
                            보호자 초대하기
                        </CardTitle>
                        <CardDescription>
                            가족이나 보호자를 초대하여 기록을 함께 관리하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!code ? (
                            <Button onClick={handleGenerateCode} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                초대 코드 생성하기
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-indigo-100 text-center shadow-sm">
                                    <div className="text-3xl font-mono font-bold tracking-widest text-indigo-600 mb-2">
                                        {code}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        이 코드를 보호자에게 공유해주세요.
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" className="w-full" onClick={copyToClipboard}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        복사
                                    </Button>

                                    {/* SMS Dialog */}
                                    <>
                                        <Button variant="outline" className="w-full" onClick={() => setSmsOpen(true)}>
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            문자
                                        </Button>
                                        <Dialog open={smsOpen} onOpenChange={handleSmsOpenChange}>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {smsStep === 'input' ? '문자로 초대하기' : '메시지 앱을 확인해주세요'}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {smsStep === 'input'
                                                            ? '초대 링크를 보낼 상대방의 전화번호를 입력하세요.'
                                                            : '메시지 앱이 열렸나요? 전송 버튼을 눌러 초대를 완료해주세요.'}
                                                    </DialogDescription>
                                                </DialogHeader>

                                                {smsStep === 'input' ? (
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="phone">전화번호</Label>
                                                            <Input
                                                                id="phone"
                                                                placeholder="01012345678"
                                                                value={recipientPhone}
                                                                onChange={(e) => setRecipientPhone(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-6 text-center text-sm text-gray-600 bg-gray-50 rounded-lg border border-dashed my-2">
                                                        <p>📲 메시지 앱에서 내용을 확인하고</p>
                                                        <p className="font-semibold text-indigo-600 mt-1">전송 버튼을 꼭 눌러주세요!</p>
                                                    </div>
                                                )}

                                                <DialogFooter>
                                                    {smsStep === 'input' ? (
                                                        <>
                                                            <Button variant="secondary" onClick={() => setSmsOpen(false)}>취소</Button>
                                                            <Button onClick={handleSendSMS} disabled={!recipientPhone}>
                                                                보내기
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button onClick={handleInviteComplete} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                                            네, 전송했습니다
                                                        </Button>
                                                    )}
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </>

                                    {/* Email Dialog */}
                                    <>
                                        <Button variant="outline" className="w-full" onClick={() => setEmailOpen(true)}>
                                            <Mail className="w-4 h-4 mr-2" />
                                            메일
                                        </Button>
                                        <Dialog open={emailOpen} onOpenChange={handleEmailOpenChange}>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {emailStep === 'input' ? '이메일로 초대하기' : '메일 앱을 확인해주세요'}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {emailStep === 'input'
                                                            ? '초대 링크를 보낼 상대방의 이메일 주소를 입력하세요.'
                                                            : '메일 작성 창이 열렸나요? 보내기 버튼을 눌러 완료해주세요.'}
                                                    </DialogDescription>
                                                </DialogHeader>

                                                {emailStep === 'input' ? (
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="email">이메일 주소</Label>
                                                            <Input
                                                                id="email"
                                                                type="email"
                                                                placeholder="recipient@example.com"
                                                                value={recipientEmail}
                                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-6 text-center text-sm text-gray-600 bg-gray-50 rounded-lg border border-dashed my-2">
                                                        <p>📧 메일 앱에서 내용을 확인하고</p>
                                                        <p className="font-semibold text-indigo-600 mt-1">보내기 버튼을 꼭 눌러주세요!</p>
                                                    </div>
                                                )}

                                                <DialogFooter>
                                                    {emailStep === 'input' ? (
                                                        <>
                                                            <Button variant="secondary" onClick={() => setEmailOpen(false)}>취소</Button>
                                                            <Button onClick={handleSendEmail} disabled={!recipientEmail}>
                                                                보내기
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button onClick={handleInviteComplete} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                                            네, 전송했습니다
                                                        </Button>
                                                    )}
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 2. Members List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        연결된 가족/보호자
                    </CardTitle>
                    <CardDescription>
                        현재 내 의료 기록을 함께 보고 있는 구성원입니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {members.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">
                                연결된 보호자가 없습니다.
                            </div>
                        ) : (
                            members.map((member) => (
                                <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                                {member.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {member.name}
                                                {member.isMe && <Badge variant="secondary" className="text-[10px]">나</Badge>}
                                                {member.role === 'owner' && !member.isMe && <Badge variant="outline" className="text-[10px]">환자 본인</Badge>}
                                            </div>
                                            <div className="text-xs text-gray-500">{member.email}</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isOwner && !member.isMe && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {member.name}님의 접근 권한이 즉시 해제되며, 의료 기록을 더 이상 볼 수 없게 됩니다.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        삭제
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
