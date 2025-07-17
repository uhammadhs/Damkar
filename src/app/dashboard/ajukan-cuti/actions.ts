
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { differenceInDays } from 'date-fns'

const LeaveRequestSchema = z.object({
  start_date: z.string().min(1, 'Tanggal mulai harus diisi'),
  end_date: z.string().min(1, 'Tanggal selesai harus diisi'),
  title: z.string().min(3, 'Judul pengajuan harus diisi'),
  reason: z.string().min(10, 'Alasan harus diisi minimal 10 karakter'),
})

export async function submitLeaveRequest(formData: FormData) {
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
      message: 'Data tidak valid.',
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
  const { data: leaveBalance, error: balanceError } = await supabase
      .from('leave_balances')
      .select('total_days, used_days')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .single();
  
  if (balanceError || !leaveBalance) {
      return { success: false, message: 'Gagal mengambil data jatah cuti.' };
  }

  const remainingDays = leaveBalance.total_days - leaveBalance.used_days;
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
  return { success: true, message: 'Pengajuan cuti berhasil dikirim.' }
}
