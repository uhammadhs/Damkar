
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Database } from '@/types/supabase';

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

  // Check if ID PJLP already exists
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id_pjlp', id_pjlp)
    .single();

  if (existingProfile) {
    return NextResponse.json({ error: 'ID PJLP sudah terdaftar. Silakan gunakan ID lain.' }, { status: 409 });
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
  
  // Explicitly insert into profiles table. This is more reliable than a trigger.
  const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      name: name,
      id_pjlp: id_pjlp,
      phone: phone,
      email: email,
      role: 'anggota'
  });

  if (profileError) {
      console.error("Error inserting profile:", profileError);
      // This is a critical error. The auth user was created but the profile wasn't.
      // For now, we'll log it and inform the user. A more robust solution might delete the auth user.
      return NextResponse.json({ error: 'Gagal menyimpan profil pengguna. Hubungi admin.' }, { status: 500 });
  }


  return NextResponse.redirect(`${requestUrl.origin}/auth/confirm`);
}
