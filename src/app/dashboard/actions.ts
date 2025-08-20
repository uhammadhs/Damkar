
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markUserNotificationAsRead(notificationId: number) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Pengguna tidak terautentikasi.' }
    }

    const { error } = await supabase
        .from('leave_requests')
        .update({ is_read_by_user: true })
        .eq('id', notificationId)
        .eq('user_id', user.id) // Security check: user can only mark their own notifications

    if (error) {
        console.error("Error marking notification as read:", error)
        return { success: false, message: 'Gagal memperbarui notifikasi.' }
    }
    
    // Revalidate the path to update the notification count in the layout
    revalidatePath('/dashboard')

    return { success: true, message: 'Notifikasi ditandai sebagai telah dibaca.' }
}
