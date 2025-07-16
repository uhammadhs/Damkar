
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

  // 1. Create the user in Supabase Auth
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `/auth/verified`,
      data: {
        name,
      }
    }
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError);
    return { success: false, message: signUpError.message };
  }

  if (!user) {
    return { success: false, message: 'Gagal membuat pengguna, silakan coba lagi.' };
  }

  // 2. The `handle_new_user` trigger has already created a basic profile.
  // Now, we update it with the name from the form.
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', user.id);

  if (updateProfileError) {
    console.error('Error updating profile after signup:', updateProfileError);
    // If profile update fails, the user is created but with an empty profile.
    // This isn't ideal, but better than failing the whole process.
    // They can update their profile later.
    return { success: false, message: `Akun dibuat, tapi gagal menyimpan detail profil: ${updateProfileError.message}` };
  }

  return { success: true, message: 'Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.' };
}
