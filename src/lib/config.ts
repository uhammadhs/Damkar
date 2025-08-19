
// Next.js automatically loads environment variables from .env.local.
// This file simply re-exports them for easy and consistent import across the application.

// Public variables, exposed to the browser
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-only variables
// IMPORTANT: For production, the service_role key must be set as an environment variable in your hosting provider.
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const resendApiKey = process.env.RESEND_API_KEY;
export const resendFromEmail = process.env.RESEND_FROM_EMAIL;
