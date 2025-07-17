
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod';

const RegisterSchema = z.object({
    name: z.string().min(3, "Nama lengkap harus diisi"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});


export async function registerUser(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validation = RegisterSchema.safeParse(rawData);

  if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
      return { success: false, message: errorMessages };
  }

  const { name, email, password } = validation.data;

  // Sign up the user. The `handle_new_user` trigger in the database
  // will automatically create a corresponding profile entry.
  // We also pass the name in user_metadata so it can be used by the trigger or self-healing mechanisms.
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // This data is useful for the profile creation trigger
      data: {
        name: name,
      },
      // The user will be redirected to this page after clicking the verification link
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verified`,
    },
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError);
    return { success: false, message: signUpError.message };
  }

  if (!data.user) {
    return { success: false, message: 'Gagal membuat pengguna, silakan coba lagi.' };
  }
  
  // No need to manually update profile here, as the trigger should handle it.
  // This simplifies the action and makes it more reliable.

  return { success: true, message: 'Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.' };
}
