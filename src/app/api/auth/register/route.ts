
import { createRouteHandlerClient } from '@supabase/ssr';
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
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  const validation = RegisterSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message).join(', ');
    return NextResponse.json({ error: errorMessages }, { status: 400 });
  }

  const { name, email, password, id_pjlp, phone } = validation.data;

  // We are using the standard signUp method which requires email confirmation.
  // Additional user data is passed in the `options.data` field.
  // This data will be available in the user's `user_metadata` after they confirm their email,
  // and will be copied to the profiles table by a trigger.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
      data: {
        name: name,
        id_pjlp: id_pjlp,
        phone: phone,
        role: 'anggota' // Set default role
      }
    }
  });

  if (error) {
    console.error("Supabase SignUp Error:", error);
    // Provide more user-friendly error messages
    if (error.message.includes('User already registered')) {
        return NextResponse.json({ error: 'Email atau pengguna dengan ID PJLP tersebut sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan pada server.' }, { status: 500 });
  }

  // On successful sign-up request, send a success response.
  // The client will then redirect the user.
  return NextResponse.json({ success: true });
}
