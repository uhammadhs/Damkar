
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseServiceRoleKey } from '@/lib/config';
import type { Database } from '@/types/supabase';

// This is a privileged client that should only be used on the server
// in server actions and route handlers. It uses the service_role key
// which bypasses RLS. Ensure this key is set in your environment variables.
export const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is not set. Admin client cannot be created.');
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRolegeRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
