
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const RegisterSchema = z.object({
  name: z.string().min(3, 'Nama lengkap harus diisi'),
  id_pjlp: z.string().min(1, 'ID PJLP harus diisi'),
  phone: z.string().min(10, 'Nomor HP tidak valid'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData.entries())

  const validation = RegisterSchema.safeParse(rawData)
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message).join(', ')
    return NextResponse.json({ error: errorMessages }, { status: 400 })
  }

  const { name, email, password, id_pjlp, phone } = validation.data

  // Use the admin client to check for duplicates, bypassing RLS
  const supabaseAdmin = createAdminClient()
  const { data: existingProfile, error: checkError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .or(`id_pjlp.eq.${id_pjlp},email.eq.${email}`)
    .limit(1)
    .single()

  if (checkError && checkError.code !== 'PGRST116') { // Ignore "No rows found"
      console.error('Error checking for duplicate profile:', checkError)
      return NextResponse.json({ error: 'Terjadi kesalahan pada server saat validasi.' }, { status: 500 });
  }

  if (existingProfile) {
    return NextResponse.json({ error: 'ID PJLP atau Email sudah terdaftar. Silakan gunakan yang lain.' }, { status: 409 }) // 409 Conflict
  }

  const supabase = createClient()

  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The user's profile is created by a database trigger, using this metadata.
      data: {
        name,
        id_pjlp,
        phone,
      },
      // The verification email will redirect to this URL
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
    },
  })

  if (signUpError) {
    console.error('Supabase SignUp Error:', signUpError)
    return NextResponse.json({ error: signUpError.message }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ error: 'Gagal membuat pengguna, silakan coba lagi.' }, { status: 500 })
  }

  // Return a success response to the client
  return NextResponse.json({ success: true, message: 'Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi.' })
}
