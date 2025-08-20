
'use server'

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const PasswordSchema = z.object({
    password: z.string().min(6, 'Password minimal 6 karakter.'),
    confirm_password: z.string()
}).refine(data => data.password === data.confirm_password, {
    message: 'Password dan konfirmasi tidak cocok.',
    path: ['confirm_password'] // path to show error
});

type State = {
    success: boolean;
    message?: string;
    error?: string;
}

export async function updatePassword(prevState: State | undefined, formData: FormData): Promise<State> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const validation = PasswordSchema.safeParse(Object.fromEntries(formData));

    if (!validation.success) {
        const error = validation.error.errors[0];
        return { success: false, error: error.message };
    }

    const { password } = validation.data;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error("Update password error:", error);
        return { success: false, error: 'Gagal memperbarui password. Sesi Anda mungkin sudah kedaluwarsa. Silakan coba minta reset password lagi.' };
    }

    return { success: true, message: 'Password berhasil diubah. Silakan login kembali dengan password baru Anda.' };
}
