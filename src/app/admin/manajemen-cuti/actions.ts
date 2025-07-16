
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLeaveRequestStatus(requestId: number, newStatus: 'Disetujui' | 'Ditolak') {
  const supabase = createClient()

  // Ambil data pengajuan untuk mendapatkan user_id dan durasi
  const { data: request, error: fetchError } = await supabase
    .from('leave_requests')
    .select('user_id, duration, start_date, leave_type_id')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    console.error('Error fetching leave request:', fetchError)
    return { success: false, message: 'Gagal menemukan pengajuan cuti.' }
  }

  // Jika status baru adalah 'Disetujui' dan jenis cuti adalah 'Cuti Tahunan', perbarui saldo cuti
  if (newStatus === 'Disetujui' && request.leave_type_id === 1) {
    const year = new Date(request.start_date).getFullYear()
    
    // Gunakan rpc untuk mengupdate saldo secara atomik
    const { error: rpcError } = await supabase.rpc('update_leave_balance', {
      p_user_id: request.user_id,
      p_year: year,
      p_days_to_add: request.duration
    });

    if (rpcError) {
      console.error('Error updating leave balance via rpc:', rpcError);
      return { success: false, message: 'Gagal memperbarui saldo cuti: ' + rpcError.message };
    }
  }

  // Perbarui status pengajuan cuti itu sendiri
  const { error: updateError } = await supabase
    .from('leave_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (updateError) {
    console.error('Error updating leave request status:', updateError)
    // TODO: Pertimbangkan untuk mengembalikan saldo cuti jika pembaruan status gagal
    return { success: false, message: 'Gagal memperbarui status pengajuan.' }
  }

  revalidatePath('/admin/manajemen-cuti')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/laporan')
  return { success: true, message: `Pengajuan berhasil ${newStatus.toLowerCase()}.` }
}
