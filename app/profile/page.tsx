import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCareTeamMembers } from "@/lib/actions/patient"
// We will create these components next
import { ProfileForm } from "@/components/profile/profile-form"
import { UserProfileForm } from "@/components/profile/user-profile-form"
import { FamilyManager } from "@/components/profile/family-manager"
import { AccountActions } from "@/components/profile/account-actions"

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch patient info (if owner)
    const { data: careTeam } = await supabase
        .from('care_team')
        .select('*, patients(*)')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single()

    // Fetch care team members
    const members = await getCareTeamMembers()

    const patient = careTeam?.patients

    return (
        <div className="min-h-screen bg-gray-50/50">
            <SiteHeader />
            <main className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">개인정보 관리</h1>
                    <p className="text-muted-foreground mt-2">
                        내 정보와 가족 연결 관리, 계정 설정을 할 수 있습니다.
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-white/50 border">
                        <TabsTrigger value="profile">내 정보 & 환자 정보</TabsTrigger>
                        <TabsTrigger value="family">가족 연결 관리</TabsTrigger>
                        <TabsTrigger value="account">계정 설정</TabsTrigger>
                    </TabsList>

                    {/* 1. Profile & Patient Info */}
                    <TabsContent value="profile" className="space-y-6">
                        <UserProfileForm user={user} initialProfile={profile} />

                        {/* Patient Info Form (Only for Owners/Patients) */}
                        {careTeam?.role === 'owner' && (
                            <ProfileForm initialData={patient} />
                        )}
                    </TabsContent>

                    {/* 2. Family Management */}
                    <TabsContent value="family">
                        <FamilyManager
                            initialMembers={members}
                            userRole={careTeam?.role || 'member'}
                            inviteCode={patient?.invite_code}
                        />
                    </TabsContent>

                    {/* 3. Account Actions */}
                    <TabsContent value="account">
                        <AccountActions />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
