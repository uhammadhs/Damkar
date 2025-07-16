
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  const supabase = createClient()

  const name = formData.get('name') as string
  const nip = formData.get('nip') as string
  const pangkat = formData.get('pangkat') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Create user in Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        // any other metadata
      },
    },
  })

  if (authError || !user) {
    console.error('Error creating user:', authError)
    return { success: false, message: authError?.message || 'Gagal membuat pengguna.' }
  }

  // 2. Create profile in 'profiles' table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      name,
      nip,
      pangkat,
      email,
      role: 'anggota' // default role
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    // Optional: Clean up created user in Auth if profile creation fails
    await supabase.auth.admin.deleteUser(user.id);
    return { success: false, message: profileError.message || 'Gagal menyimpan profil.' }
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
    
    // Using the service role key to delete a user from auth
    const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(id);

    if (deleteAuthUserError) {
        // If the user is not in auth (maybe already deleted), but still in profiles, we can proceed.
        // We log the error but don't stop the process for specific "not found" errors.
        if (deleteAuthUserError.message !== 'User not found') {
            console.error('Error deleting auth user:', deleteAuthUserError);
            return { success: false, message: deleteAuthUserError.message || 'Gagal menghapus pengguna dari autentikasi.' };
        }
    }

    // The 'profiles' table should be set up with a cascade delete on the user id foreign key,
    // so deleting the user from auth.users should automatically delete their profile.
    // If not, you need to manually delete from profiles table as well.
    // const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
    // if (profileError) {
    //      console.error('Error deleting profile:', profileError);
    //      return { success: false, message: profileError.message || 'Gagal menghapus profil.' };
    // }

    revalidatePath('/admin/anggota');
    return { success: true, message: 'Anggota berhasil dihapus.' };
}
