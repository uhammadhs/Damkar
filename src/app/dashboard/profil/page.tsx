
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

  // The self-healing logic is now primarily in the login page.
  // This page can assume a profile exists for any logged-in user.
  // If it fails here, it's a more serious issue.
  if (error || !profile) {
     console.error("Fatal: Could not find profile for a logged-in user.", { userId: user.id, error });
     // Show an error page instead of crashing.
     return <div>Tidak dapat memuat profil. Sesuatu yang kritis salah. Silakan hubungi admin.</div>;
  }

  // If profile exists, render it.
  return <ProfileClient profile={profile} />;
}
