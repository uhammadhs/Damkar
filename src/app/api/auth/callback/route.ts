
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// This route is called by Supabase after the user clicks the verification link in their email.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const cookieStore = cookies()

  if (code) {
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value, ...options })
              } catch (error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing sessions.
              }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value: '', ...options })
              } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing sessions.
              }
            },
          },
        }
    );
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
