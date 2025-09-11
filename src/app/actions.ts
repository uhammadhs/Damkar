
'use server'

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";

export type LoginState = {
  error?: string | null;
  message?: string | null;
  success?: boolean;
}

// Type for the successful return of our RPC function
type LoginResult = {
  user_id: string;
  role: string;
  email: string;
}

export async function login(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const origin = headers().get('origin');
  
  const id_pjlp = formData.get('id_pjlp') as string;
  const password = formData.get('password') as string;
  
  if (!id_pjlp || !password) {
     return { error: 'ID PJLP dan Password harus diisi.' };
  }

  const supabase = createClient();
  
  // Call the new RPC function in a single database call
  const { data, error: rpcError } = await supabase.rpc('login_with_id_pjlp', {
      p_id_pjlp: id_pjlp,
      p_password: password
  });

  // Handle potential errors from the RPC function itself
  if (rpcError) {
      console.error('RPC login error:', rpcError);
      return { error: 'Terjadi kesalahan internal saat login.' };
  }
  
  // The RPC function returns a JSON object with an error or success field
  if (data.error) {
      return { error: data.error };
  }

  // If successful, the RPC returns the user's role.
  const userRole = data.role;
  
  // Perform redirect directly from the server action
  const redirectUrl = userRole === 'admin' 
    ? `/admin/dashboard` 
    : `/dashboard`;
  
  return redirect(redirectUrl);
}
