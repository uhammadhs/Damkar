
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod';
import { cookies } from 'next/headers';

const RegisterSchema = z.object({
    name: z.string().min(3, "Nama lengkap harus diisi"),
    id_pjlp: z.string().min(5, "ID PJLP tidak valid"),
    phone: z.string().min(10, "Nomor HP tidak valid"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});


export async function registerUser(formData: FormData) {
  // We need to call cookies() to get the cookie store.
  const cookieStore = cookies();
  // Then, we pass the cookie store to our createClient function.
  const supabase = createClient();

  const rawData = {
    name: formData.get('name') as string,
    id_pjlp: formData.get('id_pjlp') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validation = RegisterSchema.safeParse(rawData);

  if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
      return { success: false, message: errorMessages };
  }

  const { name, email, password, id_pjlp, phone } = validation.data;

  // Check if ID PJLP already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id_pjlp', id_pjlp)
    .single();

  if (existingProfile) {
    return { success: false, message: 'ID PJLP sudah terdaftar. Silakan login atau gunakan ID lain.' };
  }
  
  // Create user without email verification
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        id_pjlp: id_pjlp,
        phone: phone,
      },
      // By REMOVING emailRedirectTo, Supabase will not send a confirmation email
      // and the user will be created as active.
    },
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError);
    if (signUpError.message.includes('unique constraint')) {
        return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }
    // Handle specific error for already registered user
    if (signUpError.message.includes('User already registered')) {
        return { success: false, message: 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.' };
    }
    return { success: false, message: signUpError.message };
  }

  if (!data.user) {
    return { success: false, message: 'Gagal membuat pengguna, silakan coba lagi.' };
  }

  return { success: true, message: 'Pendaftaran berhasil. Anda sekarang dapat login.' };
}
