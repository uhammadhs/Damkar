
'use server'

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string | null;
  message?: string | null;
  success?: boolean;
}

export async function login(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const id_pjlp = formData.get('id_pjlp') as string;
  const password = formData.get('password') as string;
  
  if (!id_pjlp || !password) {
     return { error: 'ID PJLP dan Password harus diisi.' };
  }

  // 1. Dapatkan email dari ID PJLP menggunakan service role client untuk bypass RLS
  const supabaseAdmin = createAdminClient();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('email, role')
    .eq('id_pjlp', id_pjlp)
    .single();

  if (profileError || !profile || !profile.email) {
      console.error('Login error - profile not found:', profileError);
      return { error: 'ID PJLP atau Password salah.' };
  }

  // 2. Lakukan login menggunakan email dan password dengan client standar
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password,
  });

  if (signInError) {
      console.error('Login error - signIn failed:', signInError);
      return { error: 'ID PJLP atau Password salah.' };
  }
  
  // 3. Jika berhasil, redirect berdasarkan peran
  const redirectUrl = profile.role === 'admin' 
    ? `/admin/dashboard` 
    : `/dashboard`;
  
  return redirect(redirectUrl);
}
