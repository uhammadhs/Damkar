
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  const supabase = createClient()

  // First, check if the current user is an admin.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Akses ditolak. Anda tidak terautentikasi.' }
  }
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profileError || profile.role !== 'admin') {
      return { success: false, message: 'Akses ditolak. Hanya admin yang bisa menambahkan anggota.' }
  }


  const name = formData.get('name') as string
  const nip = formData.get('nip') as string
  const pangkat = formData.get('pangkat') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Create user in Supabase Auth using the service role client
  // This is necessary because by default, only the user can create themselves.
  // An admin needs elevated privileges to create other users.
  // Note: For this to work in production, you'd use a dedicated service role client.
  // In this environment, the server client has sufficient privileges.
  const { data: { user: newUser }, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm user
    user_metadata: { name: name },
  })

  if (authError || !newUser) {
    console.error('Error creating user:', authError)
    return { success: false, message: authError?.message || 'Gagal membuat pengguna.' }
  }

  // 2. The trigger `handle_new_user` should have already created a profile.
  // We just need to update it with the additional details.
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({
      name,
      nip,
      pangkat,
      // The trigger sets email, id, and default role.
    })
    .eq('id', newUser.id)

  if (updateProfileError) {
    console.error('Error updating profile:', updateProfileError)
    // Optional: Clean up created user in Auth if profile creation fails
    await supabase.auth.admin.deleteUser(newUser.id);
    return { success: false, message: updateProfileError.message || 'Gagal menyimpan profil.' }
  }

  revalidatePath('/admin/anggota')
  return { success: true, message: 'Anggota berhasil ditambahkan.' }
}


export async function editMember(formData: FormData) {
    const supabase = createClient();
    const id = formData.get('id') as string;

    const updatedData = {
        name: formData.get('name') as string,
        nip: formData.get('nip') as string,
        pangkat: formData.get('pangkat') as string,
        email: formData.get('email') as string,
    };

    const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', id);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: error.message || 'Gagal memperbarui profil.' };
    }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Profil berhasil diperbarui.' };
}


export async function deleteMember(id: string) {
    const supabase = createClient();

    // The server client for `deleteUser` requires service_role privileges
    // which the default server client in this setup has.
    const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(id);

    // Because of `ON DELETE CASCADE` on the `profiles` table's foreign key,
    // deleting the user from `auth.users` will automatically delete their corresponding profile.
    // We don't need to manually delete from the profiles table.

    if (deleteAuthUserError) {
        // If the user is not in auth but still in profiles, we can proceed.
        // We log the error but don't stop the process for specific "not found" errors.
        if (deleteAuthUserError.message !== 'User not found') {
            console.error('Error deleting auth user:', deleteAuthUserError);
            return { success: false, message: deleteAuthUserError.message || 'Gagal menghapus pengguna.' };
        }
    }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Anggota berhasil dihapus.' };
}
