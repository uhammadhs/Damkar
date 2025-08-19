
import { createClient } from '@/lib/supabase/server';
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
  const requestUrl = new URL(request.url)
  const formData = await request.formData();
  const supabase = createClient();
  const supabaseAdmin = createAdminClient();

  const rawData = Object.fromEntries(formData.entries());

  const validation = RegisterSchema.safeParse(rawData);

  if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
       return NextResponse.json({ error: errorMessages }, { status: 400 });
  }

  const { name, email, password, id_pjlp, phone } = validation.data;

  // Check if ID PJLP already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id_pjlp', id_pjlp)
    .single();

  if (existingProfile) {
     return NextResponse.json({ error: 'ID PJLP sudah terdaftar. Silakan login atau gunakan ID lain.' }, { status: 409 });
  }
  
  // Create user but don't sign them in initially.
  // Let's make the user active right away without email verification.
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        id_pjlp: id_pjlp,
        phone: phone,
      },
    },
  });

  if (signUpError) {
      if (signUpError.message.includes('unique constraint') || signUpError.message.includes('already registered')) {
           return NextResponse.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' }, { status: 409 });
      }
     return NextResponse.json({ error: signUpError.message }, { status: 500 });
  }

  if (!user) {
     return NextResponse.json({ error: 'Gagal membuat pengguna, silakan coba lagi.' }, { status: 500 });
  }
  
  // Since we are skipping email verification, we need to manually confirm the user's email.
  const { error: adminUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
  );

  if (adminUpdateError) {
       // This is a server error, but we'll still redirect the user with a message
       return NextResponse.json({ error: 'Gagal mengaktifkan akun, hubungi admin.' }, { status: 500 });
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/verified`, { status: 303 });
}
