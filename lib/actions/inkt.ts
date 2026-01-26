'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateInktRecord(id: number, data: any) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('inkt_records')
        .update(data)
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/inkt')
}

export async function deleteInktRecord(id: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('inkt_records')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/inkt')
}
