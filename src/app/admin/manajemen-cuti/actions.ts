
'use server'

import { revalidatePath } from 'next/cache'
import { sendLeaveStatusEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function updateLeaveBalance(userId: string, year: number, days: number) {
    const supabase = createAdminClient();
    // Gunakan .maybeSingle() untuk menghindari error jika belum ada entri saldo untuk tahun tersebut
    const { data: balance, error } = await supabase
        .from('leave_balances')
        .select('id, used_days')
        .eq('user_id', userId)
        .eq('year', year)
        .maybeSingle();

    if (error) {
        console.error('Error fetching leave balance for update:', error);
        throw new Error('Gagal mengambil data saldo cuti untuk pembaruan.');
    }

    if (balance) {
        // Jika saldo sudah ada, tambahkan hari yang digunakan
        const { error: updateError } = await supabase
            .from('leave_balances')
            .update({ used_days: balance.used_days + days })
            .eq('id', balance.id);

        if (updateError) {
            console.error('Error incrementing leave balance:', updateError);
            throw new Error('Gagal memperbarui saldo cuti.');
        }
    } else {
        // Jika belum ada (kasus langka), buat entri baru
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

  // Step 1: Fetch the original request to get all necessary data first.
  const { data: originalRequest, error: fetchError } = await supabase
    .from('leave_requests')
    .select('id, title, start_date, end_date, user_id, duration, status')
    .eq('id', requestId)
    .single();

  if (fetchError || !originalRequest) {
    console.error('Error fetching original leave request:', fetchError);
    return { success: false, message: 'Gagal menemukan data pengajuan yang akan diperbarui.' };
  }
  
  // Prevent re-processing if the status is already the new status
  if (originalRequest.status === newStatus) {
    return { success: true, message: `Pengajuan sudah dalam status "${newStatus}". Tidak ada tindakan yang diambil.` };
  }

  // Step 2: Fetch the user profile data separately to ensure we have it for the email.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', originalRequest.user_id)
    .single();

  if (profileError || !profile || !profile.name || !profile.email) {
    console.error('Error fetching profile for notification:', profileError);
    return { success: false, message: 'Gagal mengambil data profil pengguna untuk mengirim notifikasi.' };
  }

  // Step 3: Update the leave request status.
  const { error: updateError } = await supabase
    .from('leave_requests')
    .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        is_read_by_user: false
    })
    .eq('id', requestId);

  if (updateError) {
    console.error('Error updating leave request status:', updateError);
    return { success: false, message: 'Gagal memperbarui status pengajuan. Kesalahan: ' + updateError?.message };
  }

  // Step 4: If approved, update the leave balance.
  if (newStatus === 'Disetujui') {
      try {
          const year = new Date(originalRequest.start_date).getFullYear();
          await updateLeaveBalance(originalRequest.user_id, year, originalRequest.duration);
      } catch (balanceError: any) {
          console.error(`Pembaruan status berhasil, namun gagal memperbarui saldo cuti untuk request ID ${originalRequest.id}:`, balanceError);
          // Return a failure so the admin knows the balance update failed.
          return { success: false, message: `Status berhasil diubah, tapi GAGAL memperbarui saldo cuti anggota. ${balanceError.message}` };
      }
  }

  // Revalidate paths to reflect changes across the app.
  revalidatePath('/admin/manajemen-cuti');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/laporan');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/riwayat');

  // Step 5: Send the notification email.
  try {
    await sendLeaveStatusEmail({
        to: profile.email,
        name: profile.name,
        status: newStatus,
        requestTitle: originalRequest.title,
        startDate: originalRequest.start_date,
        endDate: originalRequest.end_date
    });
  } catch (emailError: any) {
      console.error(`Pembaruan status berhasil, namun gagal mengirim email notifikasi untuk request ID ${originalRequest.id}:`, emailError);
      return { success: true, message: `Pengajuan berhasil diubah, namun notifikasi email gagal dikirim.` };
  }

  return { success: true, message: `Pengajuan berhasil diubah menjadi "${newStatus}" dan notifikasi email telah dikirim.` };
}
