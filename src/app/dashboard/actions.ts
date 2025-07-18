
'use server'

import { createClient } from "@/lib/supabase/server";

export async function markUserNotificationsAsRead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "User not authenticated." };
    }

    const { error } = await supabase
        .from('leave_requests')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error("Error marking notifications as read:", error);
        return { success: false, message: error.message };
    }

    return { success: true };
}
