
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const RegisterSchema = z.object({
    name: z.string().min(3, "Nama lengkap harus diisi"),
    id_pjlp: z.string().min(5, "ID PJLP tidak valid"),
    phone: z.string().min(10, "Nomor HP tidak valid"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const supabaseAdmin = createAdminClient();

  const rawData = Object.fromEntries(formData.entries());
  const validation = RegisterSchema.safeParse(rawData);

  if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
  }

  const { name, email, password, id_pjlp, phone } = validation.data;

  try {
    // Check if ID PJLP or Email already exists using the admin client
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id_pjlp, email')
      .or(`id_pjlp.eq.${id_pjlp},email.eq.${email}`)
      .maybeSingle();

    if (profileError) {
        throw profileError;
    }

    if (existingProfile) {
      if (existingProfile.id_pjlp === id_pjlp) {
        return NextResponse.json({ error: 'ID PJLP sudah terdaftar. Silakan login atau gunakan ID lain.' }, { status: 409 });
      }
      if (existingProfile.email === email) {
        return NextResponse.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' }, { status: 409 });
      }
    }
    
    // Use the admin client to create the user.
    // This bypasses the need for email confirmation if we set email_confirm to true.
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm user's email
        user_metadata: {
            name: name,
            id_pjlp: id_pjlp,
            phone: phone,
        },
    });

    if (signUpError) {
        // This will catch unique constraint violations on the auth.users table as a fallback
        if (signUpError.message.includes('unique constraint') || signUpError.message.includes('already registered')) {
            return NextResponse.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' }, { status: 409 });
        }
        throw signUpError;
    }

    if (!user) {
        throw new Error('Gagal membuat pengguna, silakan coba lagi.');
    }

    // Since user_metadata is used, the trigger will automatically create the profile.
    // Return a success response. The client will handle the redirect.
    return NextResponse.json({ success: true, message: "Pendaftaran berhasil." }, { status: 200 });

  } catch (error: any) {
    console.error('Registration Server Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal pada server.' }, { status: 500 });
  }
}
