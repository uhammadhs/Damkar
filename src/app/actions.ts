
'use server'

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";

export type LoginState = {
  error?: string | null;
  message?: string | null;
  success?: boolean;
  redirectUrl?: string;
}

export async function login(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const origin = headers().get('origin');
  
  const id_pjlp = formData.get('id_pjlp') as string;
  const password = formData.get('password') as string;
  
  if (!id_pjlp || !password) {
     return { error: 'ID PJLP dan Password harus diisi.' };
  }

  // 1. Find user's email by their ID PJLP first using the Admin client to bypass RLS
  const supabaseAdmin = createAdminClient();
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('email, role')
    .eq('id_pjlp', id_pjlp)
    .single();
  
  if (profileError || !profileData) {
     return { error: 'ID PJLP tidak ditemukan. Periksa kembali.' };
  }
  
  const email = profileData.email;
  if (!email) {
     return { error: 'Data email untuk pengguna ini tidak lengkap. Hubungi admin.' };
  }

  // 2. Now, sign in with the user's context using the standard server client
  const supabase = createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('Email not confirmed')) {
       return { error: 'Akun Anda belum aktif. Silakan periksa email verifikasi Anda.' };
    }
     return { error: 'Password salah. Periksa kembali.' };
  }

  const userRole = profileData.role;
  
  // 3. Prepare redirect URL based on role
  const redirectUrl = userRole === 'admin' 
    ? `${origin}/admin/dashboard` 
    : `${origin}/dashboard`;
  
  // A Server Action can't redirect directly, so we pass the URL back to the client
  return { success: true, redirectUrl };
}
