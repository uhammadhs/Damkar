
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData();
  const id_pjlp = formData.get('id_pjlp') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  if (!id_pjlp || !password) {
     return NextResponse.redirect(`${requestUrl.origin}/?error=ID PJLP dan Password harus diisi.`, {
        status: 301,
     });
  }

  // 1. Find user's email by their ID PJLP first
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id_pjlp', id_pjlp)
    .single();
  
  if (profileError || !profileData) {
     return NextResponse.redirect(`${requestUrl.origin}/?error=ID PJLP tidak ditemukan. Periksa kembali.`, {
        status: 301,
     });
  }
  
  const email = profileData.email;
  if (!email) {
     return NextResponse.redirect(`${requestUrl.origin}/?error=Data email untuk pengguna ini tidak lengkap. Hubungi admin.`, {
        status: 301,
     });
  }

  // 2. Sign in with the fetched email and provided password
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('Email not confirmed')) {
       return NextResponse.redirect(`${requestUrl.origin}/?error=Akun Anda belum aktif. Silakan hubungi admin jika masalah berlanjut.`, {
          status: 301,
       });
    }
     return NextResponse.redirect(`${requestUrl.origin}/?error=Password salah. Periksa kembali.`, {
        status: 301,
     });
  }

  const userRole = profileData.role;
  
  // 3. Redirect based on role
  if (userRole === 'admin') {
    return NextResponse.redirect(`${requestUrl.origin}/admin/dashboard`, {
        status: 301,
    });
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
    status: 301,
  });
}
