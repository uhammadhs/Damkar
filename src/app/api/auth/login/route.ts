
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const id_pjlp = formData.get('id_pjlp') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  if (!id_pjlp || !password) {
     return NextResponse.json({ error: 'ID PJLP dan Password harus diisi.' }, { status: 400 });
  }

  // 1. Find user's email by their ID PJLP first
  const { data: profileData, error: profileError } = await supabase
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

  // 2. Sign in with the fetched email and provided password
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('Email not confirmed')) {
       return NextResponse.json({ error: 'Akun Anda belum aktif. Silakan hubungi admin jika masalah berlanjut.' }, { status: 401 });
    }
     return NextResponse.json({ error: 'Password salah. Periksa kembali.' }, { status: 401 });
  }

  const userRole = profileData.role;
  
  // 3. Redirect based on role
  const redirectUrl = userRole === 'admin' 
    ? `${requestUrl.origin}/admin/dashboard` 
    : `${requestUrl.origin}/dashboard`;
  
  // This redirect will be caught by the client-side fetch and handled there.
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
