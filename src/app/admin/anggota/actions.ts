
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
  
  // Use the helper function to get the role, which is safer with RLS
  const { data: role, error: rpcError } = await supabase.rpc('get_user_role');
  if (rpcError || role !== 'admin') {
      return { success: false, message: 'Akses ditolak. Hanya admin yang bisa menambahkan anggota.' }
  }

  const name = formData.get('name') as string
  const nip = formData.get('nip') as string
  const pangkat = formData.get('pangkat') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Create user in Supabase Auth using the admin client.
  // This bypasses RLS for user creation, which is necessary.
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

  // 2. The trigger `handle_new_user` should have already created a basic profile.
  // Now, we update it with the additional details.
  // This update is performed by the admin and is allowed by the "Admin can manage" policy.
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
    const password = formData.get('password') as string;

    const profileData = {
        name: formData.get('name') as string,
        nip: formData.get('nip') as string,
        pangkat: formData.get('pangkat') as string,
        email: formData.get('email') as string,
    };
    
    // 1. Update the user's profile in the 'profiles' table.
    const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id);

    if (profileError) {
        console.error('Error updating profile:', profileError);
        return { success: false, message: profileError.message || 'Gagal memperbarui profil.' };
    }

    // 2. If a new password is provided, update the user's password in Auth.
    if (password) {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
            password: password
        });

        if (authError) {
            console.error('Error updating user password:', authError);
            return { success: false, message: authError.message || 'Gagal memperbarui password.' };
        }
    }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Profil berhasil diperbarui.' };
}


export async function deleteMember(id: string) {
    const supabase = createClient();

    // Use the admin API to delete the user from auth.
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
