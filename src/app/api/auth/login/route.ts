
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const id_pjlp = formData.get('id_pjlp') as string;
  const password = formData.get('password') as string;
  const cookieStore = cookies();

  if (!id_pjlp || !password) {
     return NextResponse.json({ error: 'ID PJLP dan Password harus diisi.' }, { status: 400 });
  }

  // 1. Find user's email by their ID PJLP first using the Admin client to bypass RLS
  const supabaseAdmin = createAdminClient();
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('email, role')
    .eq('id_pjlp', id_pjlp)
    .single();
  
  if (profileError || !profileData) {
     return NextResponse.json({ error: 'ID PJLP tidak ditemukan. Periksa kembali.' }, { status: 404 });
  }
  
  const email = profileData.email;
  if (!email) {
     return NextResponse.json({ error: 'Data email untuk pengguna ini tidak lengkap. Hubungi admin.' }, { status: 500 });
  }

  // 2. Now, sign in with the user's context using the standard server client
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('Email not confirmed')) {
       return NextResponse.json({ error: 'Akun Anda belum aktif. Silakan periksa email verifikasi Anda.' }, { status: 401 });
    }
     return NextResponse.json({ error: 'Password salah. Periksa kembali.' }, { status: 401 });
  }

  const userRole = profileData.role;
  
  // 3. Prepare redirect URL based on role
  const redirectUrl = userRole === 'admin' 
    ? `${requestUrl.origin}/admin/dashboard` 
    : `${requestUrl.origin}/dashboard`;
  
  // Return a success response with the redirect URL for the client to handle
  return NextResponse.json({ success: true, redirectUrl });
}
