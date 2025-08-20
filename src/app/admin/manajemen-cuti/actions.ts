'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateLeaveRequestStatus(requestId: number, newStatus: 'Disetujui' | 'Ditolak') {
  const supabase = createAdminClient()

  // 1. Update the status of the leave request
  const { data: request, error: updateError } = await supabase
    .from('leave_requests')
    .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString(),
        is_read_by_user: false // Mark as unread for the user
    })
    .eq('id', requestId)
    .select('id, user_id, start_date, duration') // Select only what's needed
    .single()

  if (updateError || !request) {
    console.error('Error updating leave request status:', updateError)
    return { success: false, message: 'Gagal memperbarui status pengajuan.' }
  }

  // 2. If the request was REJECTED, and we need to revert the balance,
  //    we might need a function to subtract days. For now, let's assume the balance
  //    is only updated on approval by a database trigger.
  //    If a request is changed from 'Disetujui' back to 'Menunggu' or 'Ditolak',
  //    a reverse operation would be needed.
  
  //    The primary operation is just updating the status. The balance should be handled
  //    by a database trigger on status change for reliability.
  //    (Assuming a trigger exists that on UPDATE of status='Disetujui', it updates balance)

  // 3. Revalidate paths to reflect changes across the app
  revalidatePath('/admin/manajemen-cuti')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/laporan')
  revalidatePath('/dashboard') 
  revalidatePath('/dashboard/riwayat')

  return { success: true, message: `Pengajuan berhasil diubah menjadi "${newStatus}".` }
}
