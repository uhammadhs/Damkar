
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProfileUpdateSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
  nip: z.string().optional(),
  pangkat: z.string().optional(),
  golongan: z.string().optional(),
  jabatan: z.string().optional(),
  satuanKerja: z.string().optional(),
});


export async function updateProfile(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Pengguna tidak terautentikasi." };
  }

  const rawData = {
    name: formData.get("name"),
    nip: formData.get("nip"),
    pangkat: formData.get("pangkat"),
    golongan: formData.get("golongan"),
    jabatan: formData.get("jabatan"),
    satuanKerja: formData.get("satuanKerja"),
  };
  
  const validation = ProfileUpdateSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, message: "Data tidak valid.", errors: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("profiles")
    .update(validation.data)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.message || "Gagal memperbarui profil." };
  }

  revalidatePath("/dashboard/profil");
  return { success: true, message: "Profil berhasil diperbarui." };
}

export async function changePassword(formData: FormData) {
    const supabase = createClient();
    
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (newPassword.length < 6) {
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
