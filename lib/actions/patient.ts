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

    if (error) throw error
    return code
}
