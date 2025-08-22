
'use server'

import { revalidatePath } from 'next/cache'
import { sendLeaveStatusEmail } from '@/lib/email'
import { resendApiKey, resendFromEmail } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export async function updateLeaveRequestStatus(requestId: number, newStatus: 'Disetujui' | 'Ditolak') {
  const supabase = createClient()

  // 1. Update status pengajuan dan ambil data yang diperlukan untuk email.
  const { data: request, error: updateError } = await supabase
    .from('leave_requests')
    .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        is_read_by_user: false
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

  // 3. Kirim notifikasi email, tapi periksa konfigurasi terlebih dahulu.
  if (!resendApiKey || !resendFromEmail) {
    console.warn("Peringatan: Konfigurasi email (Resend API Key atau From Email) tidak ditemukan. Notifikasi email dilewati.");
    return { 
      success: true, 
      message: `Status pengajuan berhasil diperbarui, namun notifikasi email tidak terkirim karena konfigurasi server email belum lengkap. Silakan hubungi teknisi.` 
    };
  }

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
      return { success: true, message: `Pengajuan berhasil diubah, namun notifikasi email gagal dikirim. Periksa log server untuk detail.` }
  }


  return { success: true, message: `Pengajuan berhasil diubah menjadi "${newStatus}" dan notifikasi email telah dikirim.` }
}
