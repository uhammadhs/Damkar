
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache";
import { z } from "zod";

// This schema is now only used on the server for an extra layer of validation.
const ProfileUpdateSchema = z.object({
  name: z.string().min(3, "Nama lengkap harus diisi (minimal 3 karakter)"),
  id_pjlp: z.string().min(1, "ID PJLP tidak boleh kosong"),
  phone: z.string().min(10, "Nomor HP tidak valid (minimal 10 digit)").optional(),
});

export type FormState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]> | null;
};

export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Pengguna tidak terautentikasi.", errors: null };
  }

  const rawData = {
    name: formData.get("name"),
    id_pjlp: formData.get("id_pjlp"),
    phone: formData.get("phone"),
  };
  
  const validation = ProfileUpdateSchema.safeParse(rawData);

  if (!validation.success) {
    return { 
      success: false, 
      message: 'Data tidak valid.', 
      errors: validation.error.flatten().fieldErrors 
    };
  }

  const { name, id_pjlp, phone } = validation.data;

  // 1. Update the 'profiles' table
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name, id_pjlp, phone })
    .eq("id", user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    if (profileError.message.includes('unique constraint')) {
        return { success: false, message: 'ID PJLP sudah digunakan oleh anggota lain.', errors: null };
    }
    return { success: false, message: profileError.message || "Gagal memperbarui profil.", errors: null };
  }

  // 2. Update the user_metadata in Auth to keep it in sync
   const { error: authError } = await supabase.auth.updateUser({
    data: {
      name,
      phone,
    }
  });

   if (authError) {
    console.warn("Warning: Profile table updated, but failed to update user_metadata in Auth:", authError);
    // This is not a fatal error, but it's good to know. The primary source of truth is the profiles table.
  }


  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard"); // Revalidate layout to update user name in dropdown
  return { success: true, message: "Profil berhasil diperbarui.", errors: null };
}

export async function changePassword(formData: FormData) {
    const supabase = createClient();
    
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!newPassword || newPassword.length < 6) {
        return { success: false, message: "Password baru harus terdiri dari setidaknya 6 karakter." };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, message: "Password baru dan konfirmasi tidak cocok." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        console.error("Error changing password:", error);
        return { success: false, message: error.message || "Gagal mengubah password." };
    }

    return { success: true, message: "Password berhasil diubah." };
}

