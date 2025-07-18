
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markUserNotificationsAsRead() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Pengguna tidak terautentikasi.' }
  }

  // Use a stored procedure for this to be more efficient.
  const { error } = await supabase
    .from('leave_requests')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)


  if (error) {
    console.error('Error marking notifications as read:', error);
    return { success: false, message: 'Gagal menandai notifikasi.' }
  }

  revalidatePath('/dashboard'); // Revalidate layout to update count
  return { success: true, message: 'Notifikasi ditandai sebagai telah dibaca.' }
}
