
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { differenceInDays } from 'date-fns'

const LeaveRequestSchema = z.object({
  start_date: z.string({ required_error: 'Tanggal mulai dan selesai harus diisi.' }).min(1, 'Tanggal mulai dan selesai harus diisi.'),
  end_date: z.string({ required_error: 'Tanggal mulai dan selesai harus diisi.' }).min(1, 'Tanggal mulai dan selesai harus diisi.'),
  title: z.string().min(3, 'Judul pengajuan minimal 3 karakter.'),
  reason: z.string().min(10, 'Alasan harus diisi minimal 10 karakter.'),
})

// Define a type for the structured error response
export type FormErrors = {
    start_date?: string[];
    end_date?: string[];
    title?: string[];
    reason?: string[];
};

export type FormState = {
    success: boolean;
    message: string;
    errors?: FormErrors;
}

export async function submitLeaveRequest(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Pengguna tidak terautentikasi.' }
  }

  const rawData = {
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    title: formData.get('title'),
    reason: formData.get('reason'),
  }

  const validation = LeaveRequestSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false,
      message: 'Data tidak valid. Silakan periksa kembali isian Anda.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { start_date, end_date, ...rest } = validation.data
  
  const startDateObj = new Date(start_date);
  const endDateObj = new Date(end_date);
  
  if (endDateObj < startDateObj) {
      return { success: false, message: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' };
  }

  // Hitung durasi, +1 untuk inklusif
  const duration = differenceInDays(endDateObj, startDateObj) + 1;

  // Cek sisa cuti tahunan
  const currentYear = new Date().getFullYear();
  // Gunakan .maybeSingle() untuk menghindari error jika belum ada data saldo
  const { data: leaveBalance, error: balanceError } = await supabase
      .from('leave_balances')
      .select('total_days, used_days')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .maybeSingle(); 
  
  if (balanceError) {
      console.error("Error fetching leave balance:", balanceError);
      return { success: false, message: 'Gagal memverifikasi jatah cuti. Silakan coba lagi.' };
  }
  
  // Jika belum ada data saldo, jatah cuti default 12 hari dan terpakai 0.
  // Jika sudah ada, gunakan data dari database.
  const totalDays = leaveBalance?.total_days ?? 12;
  const usedDays = leaveBalance?.used_days ?? 0;
  const remainingDays = totalDays - usedDays;

  if (duration > remainingDays) {
      return { success: false, message: `Jatah cuti tidak mencukupi. Sisa cuti Anda: ${remainingDays} hari.` };
  }


  const { error } = await supabase.from('leave_requests').insert({
    user_id: user.id,
    start_date: startDateObj.toISOString(),
    end_date: endDateObj.toISOString(),
    duration,
    ...rest,
  })

  if (error) {
    console.error('Error submitting leave request:', error)
    return { success: false, message: error.message || 'Gagal mengirim pengajuan.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/riwayat')
  // We can't redirect from here, but the success status will be used by the client to redirect.
  return { success: true, message: 'Pengajuan cuti berhasil dikirim.' }
}
