
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseServiceRoleKey } from '@/lib/config';
import type { Database } from '@/types/supabase';

// This is a privileged client that should only be used on the server
// in server actions and route handlers. It uses the service_role key
// which bypasses RLS.
export const createAdminClient = () => {
  // The service role key is now handled with a fallback in the config file,
  // so this check is simpler. We still need to ensure the basics are there.
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or key is not set. Admin client cannot be created.');
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey, // This will be either the service_role or anon key.
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
