
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route is called by Supabase after the user clicks the verification link in their email.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // On success, redirect the user directly to their dashboard.
      // This is simpler and avoids middleware race conditions.
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // If the code is missing or the exchange fails, redirect to the login page with an error.
  const redirectUrl = new URL('/', request.url)
  redirectUrl.searchParams.set('error', 'Gagal memverifikasi email. Tautan mungkin tidak valid atau kedaluwarsa.')
  return NextResponse.redirect(redirectUrl)
}
