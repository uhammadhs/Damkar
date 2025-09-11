
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Protected routes for authenticated users
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    // Redirect to login page if user is not authenticated
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is logged in, prevent access to login/register pages
  if (user && (pathname === '/' || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/update-password'))) {
     const { data: role } = await response.supabase.rpc('get_user_role');
     const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/dashboard';
     return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - auth/ (auth routes like callback, confirm, verified)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
