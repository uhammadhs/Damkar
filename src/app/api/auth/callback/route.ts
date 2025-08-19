
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This route is called by Supabase after the user clicks the verification link in their email.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth Callback Error:', error)
      // Redirect to an error page or show a message
      return NextResponse.redirect(`${origin}/?error=Gagal memverifikasi email. Silakan coba lagi.`)
    }
  }

  // Redirect user to the login page with a success message
  return NextResponse.redirect(`${origin}/?message=Email berhasil diverifikasi. Silakan login.`)
}
