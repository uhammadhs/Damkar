
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabase/admin';

const RegisterSchema = z.object({
  name: z.string().min(3, "Nama lengkap harus diisi"),
  id_pjlp: z.string().min(5, "ID PJLP tidak valid"),
  phone: z.string().min(10, "Nomor HP tidak valid"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData.entries());
  
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  const validation = RegisterSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message).join(', ');
    return NextResponse.json({ error: errorMessages }, { status: 400 });
  }

  const { name, email, password, id_pjlp, phone } = validation.data;

  // Use admin client to check for duplicates without RLS
  const supabaseAdmin = createAdminClient();
  const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .or(`id_pjlp.eq.${id_pjlp},email.eq.${email}`)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({ error: 'ID PJLP atau Email sudah terdaftar. Silakan gunakan yang lain.' }, { status: 409 });
  }

  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
      data: {
        name: name,
        id_pjlp: id_pjlp,
        phone: phone,
        role: 'anggota'
      }
    }
  });

  if (signUpError) {
    console.error("Supabase SignUp Error:", signUpError);
    if (signUpError.message.includes('User already registered')) {
        return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ error: signUpError.message || 'Terjadi kesalahan pada server.' }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Gagal membuat pengguna, silakan coba lagi.' }, { status: 500 });
  }

  // Instead of redirecting from the server, we will return a success response
  // and let the client-side handle the redirect. This is more robust.
  return NextResponse.json({ success: true, message: 'Pendaftaran berhasil, silakan periksa email Anda untuk verifikasi.' });
}
