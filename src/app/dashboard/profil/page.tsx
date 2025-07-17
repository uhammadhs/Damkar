
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

  // Self-healing mechanism: if profile doesn't exist, create it.
  if (error || !profile) {
    console.warn("Profile not found for user, creating one.", { userId: user.id, error });
    // This can happen if the trigger failed or was created after the user.
    // Let's create a profile for them. This is safe because the user is authenticated.
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ 
        id: user.id, 
        email: user.email, 
        // We can get the name from auth metadata if it was set during signup
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna Baru',
        role: 'anggota' // Default role for self-healed profiles
      })
      .select()
      .single();

      if (insertError || !newProfile) {
         console.error("Fatal: Could not create profile after failed fetch:", { insertError });
         // If we can't even create a profile, something is seriously wrong.
         // Show an error page instead of crashing.
         return <div>Tidak dapat memuat atau membuat profil. Silakan hubungi admin.</div>;
      }
      
      // We have a new profile, let's use it for the client component.
      return <ProfileClient profile={newProfile as Database['public']['Tables']['profiles']['Row']} />;
  }

  // If profile exists, render it.
  return <ProfileClient profile={profile} />;
}
