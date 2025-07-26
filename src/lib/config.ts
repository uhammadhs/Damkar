
// Next.js automatically loads environment variables from .env.local.
// This file simply re-exports them for easy and consistent import across the application.

// Public variables, exposed to the browser
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-only variables
// This is the correct way to handle the service role key.
// It prioritizes the specific service role key if it's set, which is best practice for production.
// For development or environments where it's not set, it falls back to the anon key.
// This prevents the app from crashing but relies on proper RLS for security in that fallback case.
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const resendApiKey = process.env.RESEND_API_KEY;
export const resendFromEmail = process.env.RESEND_FROM_EMAIL;
