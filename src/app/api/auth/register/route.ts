
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(3, "Nama lengkap harus diisi"),
  id_pjlp: z.string().min(5, "ID PJLP tidak valid"),
  phone: z.string().min(10, "Nomor HP tidak valid"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient();
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData.entries());

  const validation = RegisterSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message).join(', ');
    return NextResponse.json({ error: errorMessages }, { status: 400 });
  }

  const { name, email, password, id_pjlp, phone } = validation.data;

  try {
    // 1. Check if ID PJLP or Email already exists in the profiles table
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id_pjlp, email')
      .or(`id_pjlp.eq.${id_pjlp},email.eq.${email}`)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Error checking for existing profile:", profileCheckError);
      throw profileCheckError;
    }

    if (existingProfile) {
      if (existingProfile.id_pjlp === id_pjlp) {
        return NextResponse.json({ error: 'ID PJLP sudah terdaftar. Silakan login atau gunakan ID lain.' }, { status: 409 });
      }
      if (existingProfile.email === email) {
        return NextResponse.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' }, { status: 409 });
      }
    }

    // 2. Create the user in Supabase Auth
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm user's email
      user_metadata: { name }, // We can still store name for convenience
    });

    if (signUpError) {
      console.error("Error creating auth user:", signUpError);
       if (signUpError.message.includes('unique constraint') || signUpError.message.includes('already registered')) {
            return NextResponse.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' }, { status: 409 });
        }
      throw signUpError;
    }

    if (!user) {
      throw new Error('Gagal membuat pengguna di sistem otentikasi.');
    }

    // 3. **Explicitly** insert into the public.profiles table
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id, // This links the profile to the auth user
        name,
        id_pjlp,
        phone,
        email,
        role: 'anggota' // Set default role
      });

    if (profileInsertError) {
      console.error("Fatal: Auth user created, but failed to insert profile:", profileInsertError);
      // In a real-world scenario, you might want to delete the auth user here to avoid orphans.
      // For now, we'll return an error to the user.
      return NextResponse.json({ error: 'Gagal menyimpan data profil. Hubungi administrator.' }, { status: 500 });
    }

    // 4. Return success
    return NextResponse.json({ success: true, message: 'Pendaftaran berhasil.' }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Server Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal pada server.' }, { status: 500 });
  }
}
