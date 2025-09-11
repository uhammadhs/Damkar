import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/supabase";
import { ProfileClient } from "./profile-client";

export type Profile = Database['public']['Tables']['profiles']['Row'];

// This is now a pure server component.
export default async function ProfilPage() {
  const supabase = createClient();

  const {
      data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
      // This case should be handled by middleware, but it's a good safeguard.
      redirect("/");
  }

  const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

  if (error || !profile) {
      console.error("Fatal: Could not find profile for a logged-in user.", { userId: user.id, error });
      // Render an error state if the profile is unexpectedly missing.
      return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Profil Anggota</CardTitle>
                <CardDescription>
                  Tidak dapat memuat profil. Terjadi kesalahan. Hubungi admin.
                </CardDescription>
            </CardHeader>
        </Card>
      )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Profil Anggota</CardTitle>
            <CardDescription>
              Informasi pribadi dan pengaturan akun Anda.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {/* The client component receives the profile data as a prop */}
            <ProfileClient profile={profile} />
        </CardContent>
    </Card>
  );
}
