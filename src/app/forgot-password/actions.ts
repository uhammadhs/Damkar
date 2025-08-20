
'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers";
import { headers } from "next/headers";

type State = {
    success: boolean;
    message?: string;
    error?: string;
}

export async function requestPasswordReset(prevState: State | undefined, formData: FormData): Promise<State> {
    const origin = headers().get('origin');
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const email = formData.get('email') as string;
    
    if (!email) {
        return { success: false, error: 'Email harus diisi.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/update-password`,
    });

    if (error) {
        console.error("Password reset error:", error);
        return { success: false, error: 'Gagal mengirim email reset. Pastikan email Anda terdaftar.' };
    }

    return { success: true, message: 'Jika email Anda terdaftar, Anda akan menerima tautan untuk mereset password. Silakan periksa kotak masuk Anda.' };
}
