
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CookieOptions } from '@supabase/ssr'

// This route is called by Supabase after the user clicks the verification link in their email.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const cookieStore = cookies()

  if (code) {
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth Callback Error:', error)
      // Redirect to an error page or show a message
      return NextResponse.redirect(`${origin}/?error=Gagal memverifikasi email. Silakan coba lagi.`)
    }
  }

  // Redirect user to a dedicated "verified" page
  return NextResponse.redirect(`${origin}/auth/verified`)
}
