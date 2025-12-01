
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/supabase'


export async function middleware(request: NextRequest) {
  // `updateSession` returns a response object that must be used in the return statement.
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Define protected and auth-related routes
  const protectedRoutes = ['/dashboard', '/admin']
  const authRoutes = ['/', '/register', '/forgot-password', '/update-password']

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.includes(pathname)

  // Scenario 1: User is not logged in and tries to access a protected route
  if (!user && isProtectedRoute) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Scenario 2: User is logged in and tries to access an auth route (e.g., login, register)
  if (user && isAuthRoute) {
    // We need a supabase client to check the role.
    // We can create one here, as it will have the auth context from the request cookies.
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
          },
        }
      )

    const { data: role } = await supabase.rpc('get_user_role');
    const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Default case: If no specific redirection logic matched, continue the request chain.
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes, but we now explicitly allow /api/auth/callback)
     * - auth/ (auth flow routes like confirm, verified - we exclude them all)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/cron|auth/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
