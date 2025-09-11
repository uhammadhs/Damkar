
'use server'

import { revalidatePath } from 'next/cache'
import { sendLeaveStatusEmail } from '@/lib/email'
import { resendApiKey, resendFromEmail } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function updateLeaveBalance(userId: string, year: number, days: number) {
    const supabase = createAdminClient();
    const { data: balance, error } = await supabase
        .from('leave_balances')
        .select('id, used_days')
        .eq('user_id', userId)
        .eq('year', year)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
        console.error('Error fetching leave balance for update:', error);
        throw new Error('Gagal mengambil data saldo cuti untuk pembaruan.');
    }

    if (balance) {
        // Update existing balance
        const { error: updateError } = await supabase
            .from('leave_balances')
            .update({ used_days: balance.used_days + days })
            .eq('id', balance.id);

        if (updateError) {
            console.error('Error incrementing leave balance:', updateError);
            throw new Error('Gagal memperbarui saldo cuti.');
        }
    } else {
        // Insert new balance if it doesn't exist (should be rare due to trigger, but good for robustness)
        const { error: insertError } = await supabase
            .from('leave_balances')
            .insert({ user_id: userId, year, used_days: days, total_days: 12 });
        
        if (insertError) {
            console.error('Error inserting new leave balance:', insertError);
            throw new Error('Gagal membuat entri saldo cuti baru.');
        }
    }
}


export async function updateLeaveRequestStatus(requestId: number, newStatus: 'Disetujui' | 'Ditolak') {
  const supabase = createClient()

  // Here, `profiles` might be returned as an array by Supabase due to relationships.
  // We specify it can be an object or an array of objects.
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
        user_id,
        duration,
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

  // If approved, update the leave balance
  if (newStatus === 'Disetujui') {
      try {
          const year = new Date(request.start_date).getFullYear();
          await updateLeaveBalance(request.user_id, request.duration);
      } catch (balanceError: any) {
          console.error(`Pembaruan status berhasil, namun gagal memperbarui saldo cuti untuk request ID ${request.id}:`, balanceError);
          // Return a specific error to the admin
          return { success: false, message: `Status berhasil diubah, tapi GAGAL memperbarui saldo cuti anggota. ${balanceError.message}` };
      }
  }


  revalidatePath('/admin/manajemen-cuti')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/laporan')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/riwayat')

  if (!resendApiKey || !resendFromEmail) {
    console.warn("Peringatan: Konfigurasi email (Resend API Key atau From Email) tidak ditemukan. Notifikasi email dilewati.");
    return { 
      success: true, 
      message: `Status pengajuan berhasil diperbarui, namun notifikasi email tidak terkirim karena konfigurasi server email belum lengkap.` 
    };
  }

  try {
    // Safely access the profile object, whether it's a single object or the first element of an array.
    const profile = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles;

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
      return { success: true, message: `Pengajuan berhasil diubah, namun notifikasi email gagal dikirim.` }
  }


  return { success: true, message: `Pengajuan berhasil diubah menjadi "${newStatus}" dan notifikasi email telah dikirim.` }
}

