
'use server'

import { createClient } from "@/lib/supabase/server";

export async function markAdminNotificationsAsRead(notificationIds: number[]) {
    if (!notificationIds || notificationIds.length === 0) {
        return { success: true };
    }
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Pengguna tidak terautentikasi.' };
    }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds)
        .eq('user_id', user.id); // Ensure user can only update their own notifications

    if (error) {
        console.error("Error marking admin notifications as read:", error);
        return { success: false, message: 'Gagal memperbarui notifikasi.' };
    }
    
    return { success: true };
}
