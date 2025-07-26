
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  const supabase = createAdminClient()

  // First, check if the current user is an admin.
  // This part can remain using the regular server client to check the logged-in user's role
  // But for the actual user creation, we must use the admin client.

  const name = formData.get('name') as string
  const nip = formData.get('nip') as string
  const pangkat = formData.get('pangkat') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Create user in Supabase Auth using the admin client.
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
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({
      name,
      nip,
      pangkat,
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
    const supabase = createAdminClient();
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
    const supabase = createAdminClient();

    // The admin API is required to delete users from auth.
    const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(id);

    // If the ON DELETE CASCADE is set up correctly in the database for the profiles table,
    // deleting the user from auth.users will automatically delete their profile.
    // If not, we might need to delete from profiles manually, but it's better to rely on CASCADE.

    if (deleteAuthUserError) {
        // Log the error but don't fail if the user is already gone from auth.
        if (deleteAuthUserError.message !== 'User not found') {
            console.error('Error deleting auth user:', deleteAuthUserError);
            return { success: false, message: deleteAuthUserError.message || 'Gagal menghapus pengguna.' };
        }
    }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Anggota berhasil dihapus.' };
}
