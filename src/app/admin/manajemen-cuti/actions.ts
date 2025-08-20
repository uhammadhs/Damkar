
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
    .select()
    .single()

  if (updateError || !request) {
    console.error('Error updating leave request status:', updateError)
    return { success: false, message: 'Gagal memperbarui status pengajuan.' }
  }

  // 2. If approved, update the leave balance using the RPC function
  //    This logic assumes the leave request status was 'Menunggu' before.
  //    If a request is changed from 'Ditolak' to 'Disetujui', this logic would need adjustment.
  if (newStatus === 'Disetujui') {
    const year = new Date(request.start_date).getFullYear()
    
    const { error: rpcError } = await supabase.rpc('update_leave_balance', {
      p_user_id: request.user_id,
      p_year: year,
      p_days_to_add: request.duration
    });

    if (rpcError) {
      console.error('Error updating leave balance via rpc:', rpcError);
      // Even if balance update fails, the request status is updated. 
      // This might require manual correction by the admin.
      // For now, we return a specific error message.
      return { success: false, message: 'Status pengajuan diperbarui, tetapi gagal memperbarui saldo cuti anggota: ' + rpcError.message };
    }
  }

  // 3. Revalidate paths to reflect changes across the app
  revalidatePath('/admin/manajemen-cuti')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/laporan')
  revalidatePath('/dashboard') 
  revalidatePath('/dashboard/riwayat')

  return { success: true, message: `Pengajuan berhasil diubah menjadi "${newStatus}".` }
}
