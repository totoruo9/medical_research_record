'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Check if user has any care team membership
export async function checkUserOnboardingStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { isOnboarded: false, isNewUser: true }

    const { data: teams, error } = await supabase
        .from('care_team')
        .select('*')
        .eq('user_id', user.id)

    if (error) {
        console.error("Error checking onboarding status:", error)
        return { isOnboarded: false, isNewUser: false }
    }

    // If records exist, user is onboarded
    return {
        isOnboarded: teams && teams.length > 0,
        isNewUser: false,
        user
    }
}

// Option 1: I am a Patient (Create Self Record)
export async function registerAsPatient() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 1. Get user profile for name
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const name = profile?.full_name || profile?.email || "환자"

    // 2. Create Patient Record (ID = User ID for simplicity in self-care scenario)
    const { error: pError } = await supabase.from('patients').insert({
        id: user.id, // Trying to use same ID, if RLS allows. Or generate new.
        // Actually, schema said 'default gen_random_uuid()'.
        // Let's use the USER ID as Patient ID for the self-patient to avoid confusion?
        // Wait, migration used select id from profiles. So YES, explicit ID is good.
        name: name,
        created_by: user.id
    })

    // If inserting with specific ID fails (e.g. duplicate?), let's imply success or handle it.
    // Ideally we assume this is a fresh user.

    if (pError) throw new Error("분석 프로필 생성 실패: " + pError.message)

    // 3. Add to Care Team
    const { error: tError } = await supabase.from('care_team').insert({
        patient_id: user.id,
        user_id: user.id,
        role: 'owner'
    })

    if (tError) throw new Error("팀 등록 실패: " + tError.message)

    revalidatePath('/')
    return { success: true }
}

// Option 2: I am a Guardian (Join existing)
export async function joinPatientByCode(code: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 1. Find patient by code
    const { data: patient, error: findError } = await supabase
        .from('patients')
        .select('id, name')
        .eq('invite_code', code)
        .single()

    if (findError || !patient) throw new Error("유효하지 않은 초대 코드입니다.")

    // 2. Add to Care Team
    const { error: joinError } = await supabase.from('care_team').insert({
        patient_id: patient.id,
        user_id: user.id,
        role: 'member'
    })

    if (joinError) {
        if (joinError.code === '23505') throw new Error("이미 등록된 환자입니다.")
        throw new Error("연동 실패: " + joinError.message)
    }

    revalidatePath('/')
    return { success: true, patientName: patient.name }
}

// Utils: Generate Code (For Patient to share)
export async function createInviteCode() { // Should pass patient ID if managing multiple, but defaulting to self for now if single
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Find the patient record "owned" by this user or just the first one?
    // For now assuming Self-Patient model mostly.

    // Check if code exists
    const { data: existing } = await supabase
        .from('patients')
        .select('invite_code')
        .eq('created_by', user.id)
        .single()

    if (existing?.invite_code) return existing.invite_code

    // Generate new code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await supabase
        .from('patients')
        .update({ invite_code: code })
        .eq('created_by', user.id)

    // Update existing invite code if not exists
    if (error) {
        // Try to update one more time or just select existing if race condition?
        // For now, let's just return what we have or throw
        throw error
    }
    return code
}


// --- New Actions for Profile & Family Management ---

// 1. Update Patient Profile
export async function updatePatientProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const name = formData.get('name') as string
    const diagnosis = formData.get('diagnosis') as string
    const hospital = formData.get('hospital') as string
    const doctor = formData.get('doctor') as string

    // Update patient where created_by is me (Patient role)
    // OR if I am 'owner' in care_team.
    // Simplifying to: Update the patient record associated with this user (as owner)

    // Find patient ID first
    const { data: patient } = await supabase
        .from('care_team')
        .select('patient_id')
        .eq('user_id', user.id)
        .eq('role', 'owner') // Only owner can edit profile info? Or allow guardians too? Owner for now.
        .single()

    if (!patient) throw new Error("환자 정보를 찾을 수 없거나 수정 권한이 없습니다.")

    const { error } = await supabase
        .from('patients')
        .update({
            name,
            diagnosis,
            hospital_name: hospital,
            primary_doctor: doctor
        })
        .eq('id', patient.patient_id)

    if (error) throw new Error("프로필 수정 실패: " + error.message)

    revalidatePath('/profile')
    return { success: true }
}

// 2. Get Care Team Members
export async function getCareTeamMembers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Find the patient I own (assuming single patient model for now)
    const { data: myPatientRel } = await supabase
        .from('care_team')
        .select('patient_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single()

    if (!myPatientRel) return []

    // 2. Get all members for this patient
    const { data: members, error } = await supabase
        .from('care_team')
        .select(`
            id,
            user_id,
            role,
            created_at
        `)
        .eq('patient_id', myPatientRel.patient_id)

    if (error) {
        console.error("Error fetching team:", error)
        return []
    }

    if (!members || members.length === 0) return []

    // 3. Manual fetch of profiles to avoid complex joins issues
    const userIds = members.map(m => m.user_id)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    return members.map(m => {
        const profile = profileMap.get(m.user_id)
        return {
            id: m.id, // care_team id
            userId: m.user_id,
            role: m.role,
            joinedAt: m.created_at,
            name: profile?.full_name || '이름 없음',
            email: profile?.email || '이메일 없음',
            isMe: m.user_id === user.id
        }
    })
}

// 3. Remove Member
export async function removeCareTeamMember(memberId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Verify I am owner
    const { data: amOwner } = await supabase
        .from('care_team')
        .select('patient_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single()

    if (!amOwner) throw new Error("관리자 권한이 필요합니다.")

    // Perform deletion
    // Ensure we are not deleting ourselves via this simple ID check? 
    // UI should block it, but DB constraints/logic should allow it if we want to leave?
    // 'removeCareTeamMember' implies removing OTHERS.

    const { error } = await supabase
        .from('care_team')
        .delete()
        .eq('id', memberId)
        .neq('user_id', user.id) // Prevent self-delete here for safety, separate 'leave' action if needed.

    if (error) throw new Error("멤버 삭제 실패: " + error.message)

    revalidatePath('/profile')
    return { success: true }
}

// 4. Delete Account
export async function deleteAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Admin API is needed to delete auth.users, which we can't do from client/server action easily without service key.
    // BUT we can delete data from public tables.
    // Auth user deletion requires Service Role Key, which we shouldn't expose or might not have in scope here easily?
    // Alternative: We delete the 'profiles' row? Or 'patients' row?
    // NextJS Server Action has process.env.SUPABASE_SERVICE_ROLE_KEY usually?

    // For now, let's Soft Delete or just clean up data.
    // Or simpler: Just delete the 'profiles' row if RLS allows? 
    // Usually auth cancellation is complex.

    // Let's try to delete public.profiles (cascade should handle the rest usually?)
    // But profiles is PK references auth.users.

    // Workaround: Call Supabase Admin Delete User if possible, or just wipe data.
    // Let's wipe the 'profiles' entry.
    // const { error } = await supabase.from('profiles').delete().eq('id', user.id)

    // If we can't fully delete auth user, at least sign out and maybe mark as deleted?
    // Let's stick to "Sign Out" + "Data Wipe" for MVP.
    // Actually, user asked for "Withdrawal".

    // 1. Delete care team memberships
    await supabase.from('care_team').delete().eq('user_id', user.id)

    // 2. Delete patient record if I created it?
    await supabase.from('patients').delete().eq('created_by', user.id)

    // 3. Delete profile
    const { error } = await supabase.from('profiles').delete().eq('id', user.id)

    if (error) {
        console.error("Account wipe failed", error)
        throw new Error("탈퇴 처리 중 오류가 발생했습니다.")
    }

    // 4. Sign out
    await supabase.auth.signOut()
    redirect('/login')
}
