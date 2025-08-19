
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// This is a privileged client that should only be used on the server
// in server actions and route handlers. It uses the service_role key
// which bypasses RLS.
// It's essential that the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly in your environment.
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or service role key is not set. Admin client cannot be created.');
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
