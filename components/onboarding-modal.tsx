'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { User, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { registerAsPatient, joinPatientByCode } from '@/lib/actions/patient'
import { useRouter } from 'next/navigation'

export function OnboardingModal({ show }: { show: boolean }) {
    const [step, setStep] = useState<'select' | 'code'>('select')
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!show) return null

    const handleRegisterPatient = async () => {
        setLoading(true)
        try {
            await registerAsPatient()
            router.refresh()
            // Modal will close automatically as parent re-renders with show=false
        } catch (e: any) {
            alert(e.message)
            setLoading(false)
        }
    }

    const handleJoinGuardian = async () => {
        if (!inviteCode) return
        setLoading(true)
        try {
            await joinPatientByCode(inviteCode)
            alert('연동되었습니다!')
            router.refresh()
        } catch (e: any) {
            alert(e.message)
            setLoading(false)
        }
    }

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-2xl [&>button]:hidden"> {/* Hide close button to force choice */}
                <DialogHeader className="text-center pb-4">
                    <DialogTitle className="text-2xl font-bold">환영합니다!</DialogTitle>
                    <DialogDescription className="text-base text-gray-500">
                        서비스 이용을 위해 역할을 선택해주세요.
                    </DialogDescription>
                </DialogHeader>

                {step === 'select' ? (
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <Card
                            className="cursor-pointer hover:border-black hover:bg-gray-50 transition-all group relative overflow-hidden"
                            onClick={handleRegisterPatient}
                        >
                            <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center space-y-4">
                                {loading ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                                ) : (
                                    <>
                                        <div className="p-4 bg-blue-100 rounded-full text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">환자입니다</h3>
                                            <p className="text-sm text-gray-500">
                                                내 의료 기록을 직접 관리하고 기록합니다.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:border-black hover:bg-gray-50 transition-all group"
                            onClick={() => setStep('code')}
                        >
                            <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center space-y-4">
                                <div className="p-4 bg-green-100 rounded-full text-green-600 mb-2 group-hover:scale-110 transition-transform">
                                    <Users className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">보호자입니다</h3>
                                    <p className="text-sm text-gray-500">
                                        환자분의 초대를 받아 기록을 함께 관리합니다.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="py-6 space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="font-bold text-xl">초대 코드 입력</h3>
                            <p className="text-gray-500 text-sm">
                                환자분에게 전달받은 6자리 초대 코드를 입력해주세요.
                            </p>
                        </div>

                        <div className="max-w-xs mx-auto space-y-4">
                            <Input
                                placeholder="초대 코드 (예: AB12CD)"
                                className="text-center text-lg tracking-widest uppercase h-12"
                                maxLength={6}
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            />
                            <Button className="w-full h-11 text-base" onClick={handleJoinGuardian} disabled={loading || inviteCode.length < 6}>
                                {loading ? '연동 중...' : '연동 시작하기'}
                                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setStep('select')}>
                                뒤로 가기
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
