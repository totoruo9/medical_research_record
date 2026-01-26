'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateBloodTest(id: number, data: any) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('blood_tests')
        .update(data)
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/blood-tests')
}

export async function deleteBloodTest(id: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('blood_tests')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/blood-tests')
}
