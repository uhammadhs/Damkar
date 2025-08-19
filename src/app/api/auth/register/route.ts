
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

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

  const rawData = {
    name: formData.get('name') as string,
    id_pjlp: formData.get('id_pjlp') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validation = RegisterSchema.safeParse(rawData);

  if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
       return NextResponse.redirect(`${requestUrl.origin}/register?error=${encodeURIComponent(errorMessages)}`, {
          status: 301,
       });
  }

  const { name, email, password, id_pjlp, phone } = validation.data;

  // Check if ID PJLP already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id_pjlp', id_pjlp)
    .single();

  if (existingProfile) {
     return NextResponse.redirect(`${requestUrl.origin}/register?error=${encodeURIComponent('ID PJLP sudah terdaftar. Silakan login atau gunakan ID lain.')}`, {
        status: 301,
     });
  }
  
  const { error: signUpError } = await supabase.auth.signUp({
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
     return NextResponse.redirect(`${requestUrl.origin}/register?error=${encodeURIComponent(signUpError.message)}`, {
        status: 301,
     });
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/verified`, {
    status: 301,
  });
}
