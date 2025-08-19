
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  const supabase = createAdminClient()

  const name = formData.get('name') as string
  const nip = formData.get('nip') as string
  const pangkat = formData.get('pangkat') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Create user in Supabase Auth using the admin client.
  // Pass metadata that the `handle_new_user` trigger can use.
  const { data: { user: newUser }, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm user
    user_metadata: { 
      name: name,
      // The trigger will use this name, so we don't need to update it separately
      // unless we have other fields to add immediately.
    },
  })

  if (authError || !newUser) {
    console.error('Error creating user:', authError)
    return { success: false, message: authError?.message || 'Gagal membuat pengguna.' }
  }

  // 2. The trigger `handle_new_user` should have already created a basic profile.
  // Now, we update it with the additional details (NIP, Pangkat).
  // This is more robust than relying on the trigger to do everything.
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({
      name, // Also update name here to be safe
      nip,
      pangkat,
    })
    .eq('id', newUser.id)

  if (updateProfileError) {
    console.error('Error updating profile:', updateProfileError)
    // Important: Clean up the created auth user if profile update fails to prevent orphans.
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
        .update({
          name: profileData.name,
          nip: profileData.nip,
          pangkat: profileData.pangkat
        })
        .eq('id', id);

    if (profileError) {
        console.error('Error updating profile:', profileError);
        return { success: false, message: profileError.message || 'Gagal memperbarui profil.' };
    }

    // 2. Update Auth user attributes (email, password)
    const authUpdatePayload: any = { email: profileData.email };
    if (password) {
        authUpdatePayload.password = password;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdatePayload);

    if (authError) {
        console.error('Error updating user in Auth:', authError);
        // Note: We don't rollback the profile change here, but in a production app you might want to.
        return { success: false, message: authError.message || 'Gagal memperbarui data login.' };
    }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Profil berhasil diperbarui.' };
}


export async function deleteMember(id: string) {
    const supabase = createAdminClient();

    // The admin API is required to delete users from auth.
    // This call will fail if the client doesn't have service_role permissions.
    const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(id);

    // ON DELETE CASCADE in the database should handle deleting the profile.
    // If the user was already deleted from auth but the profile remains (orphan),
    // we might need to clean it up, but that's a separate maintenance task.
    // The primary action is deleting the auth user.

    if (deleteAuthUserError) {
        console.error('Error deleting auth user:', deleteAuthUserError);
        return { success: false, message: deleteAuthUserError.message || 'User not allowed' };
    }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Anggota berhasil dihapus.' };
}
