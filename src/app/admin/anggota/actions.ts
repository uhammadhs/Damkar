
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  const supabase = createAdminClient()

  const data = Object.fromEntries(formData.entries())

  const name = data.name as string
  const id_pjlp = data.id_pjlp as string
  const phone = data.phone as string
  const email = data.email as string
  const password = data.password as string

  if (!name || !id_pjlp || !phone || !email || !password) {
      return { success: false, message: 'Semua kolom harus diisi.' }
  }
  
  // Check if ID PJLP already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id_pjlp', id_pjlp)
    .single();

  if (existingProfile) {
    return { success: false, message: 'ID PJLP sudah terdaftar. Silakan gunakan ID lain.' };
  }

  const { data: { user: newUser }, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for admin-created users
    user_metadata: { 
      name: name,
      id_pjlp: id_pjlp,
      phone: phone,
    },
  })

  if (authError || !newUser) {
    console.error('Error creating user:', authError)
    if (authError?.message.includes('unique constraint') && authError.message.includes('email')) {
      return { success: false, message: 'Email sudah digunakan oleh pengguna lain.' }
    }
    return { success: false, message: authError?.message || 'Gagal membuat pengguna.' }
  }

  revalidatePath('/admin/anggota')
  return { success: true, message: 'Anggota berhasil ditambahkan.' }
}


export async function editMember(formData: FormData) {
    const supabase = createAdminClient();
    const data = Object.fromEntries(formData.entries());

    const id = data.id as string;
    const password = data.password as string;

    const profileData = {
        name: data.name as string,
        id_pjlp: data.id_pjlp as string,
        phone: data.phone as string,
        email: data.email as string,
    };
    
    // 1. Update the user's profile in the 'profiles' table.
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          id_pjlp: profileData.id_pjlp,
          phone: profileData.phone,
        })
        .eq('id', id);

    if (profileError) {
        console.error('Error updating profile:', profileError);
         if (profileError.message.includes('unique constraint')) {
            return { success: false, message: 'ID PJLP sudah digunakan oleh anggota lain.' };
        }
        return { success: false, message: profileError.message || 'Gagal memperbarui profil.' };
    }

    // 2. Update Auth user attributes (email, password)
    const authUpdatePayload: any = { email: profileData.email };
    if (password) {
        authUpdatePayload.password = password;
    }

    const { data: updatedUser, error: authError } = await supabase.auth.admin.updateUserById(id, authUpdatePayload);

    if (authError) {
        console.error('Error updating user in Auth:', authError);
        return { success: false, message: authError.message || 'Gagal memperbarui data login.' };
    }
    
    // 3. If email was changed, update it in the profiles table too.
    if (updatedUser.user && updatedUser.user.email) {
        const { error: emailUpdateError } = await supabase
            .from('profiles')
            .update({ email: updatedUser.user.email })
            .eq('id', id);

        if (emailUpdateError) {
            console.error('Error syncing email to profile:', emailUpdateError);
            // Non-fatal error, but good to know.
        }
    }


    revalidatePath('/admin/anggota');
    return { success: true, message: 'Profil berhasil diperbarui.' };
}


export async function deleteMember(id: string) {
    const supabase = createAdminClient();
    const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(id);

    if (deleteAuthUserError) {
        console.error('Error deleting auth user:', deleteAuthUserError);
        return { success: false, message: deleteAuthUserError.message || 'Gagal menghapus anggota.' };
    }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Anggota berhasil dihapus.' };
}
