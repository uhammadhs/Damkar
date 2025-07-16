
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";
import type { Database } from "@/types/supabase";

export default async function ProfilPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Profile not found for user, creating one.", { userId: user.id, error });
    // This can happen if the trigger failed or was created after the user.
    // Let's try to create a profile for them.
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ 
        id: user.id, 
        email: user.email, 
        name: user.email?.split('@')[0] || 'New User',
        role: 'anggota' 
      })
      .select()
      .single()

      if (insertError || !newProfile) {
         console.error("Error creating profile after failed fetch:", { insertError });
         return <div>Tidak dapat memuat profil. Silakan coba muat ulang halaman.</div>;
      }
      
      // We have a new profile, let's use it.
      return <ProfileClient profile={newProfile as Database['public']['Tables']['profiles']['Row']} />;
  }

  return <ProfileClient profile={profile} />;
}
