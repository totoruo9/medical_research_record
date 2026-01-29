'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password) {
        return { error: '이메일과 비밀번호를 입력해주세요.' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName || email.split('@')[0],
            },
        },
    })

    if (error) {
        console.error("SignUp Error:", error)
        return { error: error.message }
    }

    // If email confirmation is enabled, this might need handling
    return { success: true, message: '회원가입이 완료되었습니다. 이메일함에서 인증 링크를 확인해주세요.' }
}

export async function signInWithEmail(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("SignIn Error:", error)
        return { error: '로그인 실패: 이메일 또는 비밀번호를 확인해주세요.' }
    }

    redirect('/dashboard')
}
