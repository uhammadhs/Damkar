'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateLeaveRequestStatus(requestId: number, newStatus: 'Disetujui' | 'Ditolak') {
  const supabase = createAdminClient()

  // 1. Update the status of the leave request.
  // The database trigger 'on_leave_request_status_change' will handle the balance update automatically.
  const { data: request, error: updateError } = await supabase
    .from('leave_requests')
    .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        is_read_by_user: false // Mark as unread for the user
    })
    .eq('id', requestId)
    .select('id')
    .single()

  if (updateError || !request) {
    console.error('Error updating leave request status:', updateError)
    return { success: false, message: 'Gagal memperbarui status pengajuan. Kesalahan: ' + updateError?.message }
  }

  // 2. Revalidate paths to reflect changes across the app
  revalidatePath('/admin/manajemen-cuti')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/laporan')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/riwayat')

  return { success: true, message: `Pengajuan berhasil diubah menjadi "${newStatus}".` }
}
