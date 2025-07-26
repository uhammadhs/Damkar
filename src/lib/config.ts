
// Next.js automatically loads environment variables from .env.local.
// This file simply re-exports them for easy and consistent import across the application.

// Public variables, exposed to the browser
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-only variables
// IMPORTANT: For production, the service_role key should be set as an environment variable.
// For development convenience, we are using the provided key directly as a fallback.
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoa2JvbHl3dWR6Y3BuanZ6bmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc2ODEyNCwiZXhwIjoyMDY4MzQ0MTI0fQ.UN6Pd3bo_GIAHcx0cbZhYhzG-f5Bc_bTCtPKK3DmPcc";
export const resendApiKey = process.env.RESEND_API_KEY;
export const resendFromEmail = process.env.RESEND_FROM_EMAIL;
