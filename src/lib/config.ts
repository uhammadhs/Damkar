
// Next.js automatically loads environment variables from .env.local.
// This file simply re-exports them for easy and consistent import across the application.

// Public variables, exposed to the browser
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-only variables
// In a production environment, it's best practice to use a separate, more privileged
// service role key. However, to prevent crashes when that key isn't set,
// we'll fall back to the public anon key. This requires proper RLS policies.
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const resendApiKey = process.env.RESEND_API_KEY;
export const resendFromEmail = process.env.RESEND_FROM_EMAIL;

