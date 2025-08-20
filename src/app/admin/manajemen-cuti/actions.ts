
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendLeaveStatusEmail } from '@/lib/email'

export async function updateLeaveRequestStatus(requestId: number, newStatus: 'Disetujui' | 'Ditolak') {
  const supabase = createAdminClient()

  // Ambil data pengajuan untuk mendapatkan user_id, durasi, dan data profil untuk email
  const { data: request, error: fetchError } = await supabase
    .from('leave_requests')
    .select(`
      user_id,
      duration,
      start_date,
      end_date,
      title,
      profiles (
        email,
        name
      )
    `)
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    console.error('Error fetching leave request:', fetchError)
    return { success: false, message: 'Gagal menemukan pengajuan cuti.' }
  }

  // Jika status baru adalah 'Disetujui', perbarui saldo cuti
  if (newStatus === 'Disetujui') {
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

  // Perbarui status pengajuan cuti itu sendiri dan set is_read_by_user menjadi false
  const { error: updateError } = await supabase
    .from('leave_requests')
    .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString(),
        is_read_by_user: false // IMPORTANT: Mark as unread for the user
    })
    .eq('id', requestId)

  if (updateError) {
    console.error('Error updating leave request status:', updateError)
    // TODO: Pertimbangkan untuk mengembalikan saldo cuti jika pembaruan status gagal
    return { success: false, message: 'Gagal memperbarui status pengajuan.' }
  }

  // Kirim notifikasi email setelah semuanya berhasil
  try {
    const userEmail = request.profiles?.email;
    const userName = request.profiles?.name;
    if (userEmail && userName) {
        await sendLeaveStatusEmail({
            to: userEmail,
            name: userName,
            status: newStatus,
            requestTitle: request.title,
            startDate: request.start_date,
            endDate: request.end_date,
        });
    }
  } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Jangan gagalkan seluruh proses jika email gagal, cukup log error
      // Namun, kembalikan pesan bahwa email mungkin tidak terkirim
      revalidatePath('/admin/manajemen-cuti')
      revalidatePath('/admin/dashboard')
      revalidatePath('/admin/laporan')
      revalidatePath('/dashboard') // Revalidate user dashboard for notifications
      return { success: true, message: `Pengajuan berhasil ${newStatus.toLowerCase()}, tetapi notifikasi email gagal dikirim.` }
  }


  revalidatePath('/admin/manajemen-cuti')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/laporan')
  revalidatePath('/dashboard') // Revalidate user dashboard for notifications
  return { success: true, message: `Pengajuan berhasil ${newStatus.toLowerCase()} dan notifikasi email telah dikirim.` }
}
