
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendLeaveStatusEmail } from '@/lib/email'

export async function updateLeaveRequestStatus(requestId: number, newStatus: 'Disetujui' | 'Ditolak') {
  const supabase = createAdminClient()

  // 1. Update status pengajuan dan ambil data yang diperlukan untuk email.
  //    Kita butuh nama & email pemohon, serta detail pengajuan.
  const { data: request, error: updateError } = await supabase
    .from('leave_requests')
    .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        is_read_by_user: false // Tandai sebagai belum dibaca untuk notifikasi di app
    })
    .eq('id', requestId)
    .select(`
        id,
        title,
        start_date,
        end_date,
        profiles (
            name,
            email
        )
    `)
    .single()

  if (updateError || !request) {
    console.error('Error updating leave request status:', updateError)
    return { success: false, message: 'Gagal memperbarui status pengajuan. Kesalahan: ' + updateError?.message }
  }

  // 2. Revalidasi path agar perubahan UI terlihat segera.
  revalidatePath('/admin/manajemen-cuti')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/laporan')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/riwayat')

  // 3. Kirim notifikasi email ke anggota.
  //    Proses ini dibungkus try-catch agar jika email gagal, pembaruan status tetap berhasil.
  try {
    const profile = request.profiles;
    if (!profile || !profile.email || !profile.name) {
        throw new Error('Informasi profil (nama/email) tidak lengkap untuk pengiriman notifikasi.');
    }
    
    await sendLeaveStatusEmail({
        to: profile.email,
        name: profile.name,
        status: newStatus,
        requestTitle: request.title,
        startDate: request.start_date,
        endDate: request.end_date
    });

  } catch (emailError) {
      console.error(`Pembaruan status berhasil, namun gagal mengirim email notifikasi untuk request ID ${request.id}:`, emailError);
      // Kita tidak mengembalikan error ke client karena proses utamanya (update status) sudah berhasil.
      // Cukup kembalikan pesan sukses dengan peringatan.
      return { success: true, message: `Pengajuan berhasil ${newStatus.toLowerCase()}, namun notifikasi email gagal dikirim.` }
  }


  return { success: true, message: `Pengajuan berhasil diubah menjadi "${newStatus}" dan notifikasi email telah dikirim.` }
}
