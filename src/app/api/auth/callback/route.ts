
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route is called by Supabase after the user clicks the verification link in their email.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/verified' // Default to verified page

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // URL is validated by Supabase so we can trust it.
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to an error page or show a message if something went wrong
  const redirectUrl = new URL('/', request.url)
  redirectUrl.searchParams.set('error', 'Gagal memverifikasi email. Silakan coba lagi.')
  return NextResponse.redirect(redirectUrl)
}
