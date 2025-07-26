
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseServiceRoleKey } from '@/lib/config';

// This is a privileged client that should only be used on the server
// in server actions and route handlers. It uses the service_role key
// which bypasses RLS.
export const createAdminClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Admin client cannot be created.');
  }

  return createClient(
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
