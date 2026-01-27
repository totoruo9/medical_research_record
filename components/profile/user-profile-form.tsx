'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateUserAvatar } from "@/lib/actions/user"

interface UserProfileFormProps {
    user: any // Supabase user object or profile object
    initialProfile: any // from profiles table
}

export function UserProfileForm({ user, initialProfile }: UserProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || user?.user_metadata?.avatar_url || "")
    const [fullName, setFullName] = useState(initialProfile?.full_name || user?.user_metadata?.full_name || "")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateUserAvatar(avatarUrl)
            toast.success("프로필 이미지 업데이트 완료")
        } catch (error) {
            console.error(error)
            toast.error("프로필 업데이트 실패")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>내 프로필</CardTitle>
                <CardDescription>
                    앱에서 보여지는 내 정보입니다.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback>
                                <UserCircle className="h-20 w-20 text-gray-400" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="avatarUrl">프로필 이미지 URL</Label>
                            <Input
                                id="avatarUrl"
                                placeholder="https://example.com/my-image.jpg"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                이미지 주소를 입력하여 프로필 사진을 변경하세요.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>이메일</Label>
                        <Input value={user.email || ''} disabled className="bg-gray-50" />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            저장하기
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
