
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import Loading from "./loading";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { ProfileClient } from "./profile-client";

export type Profile = Database['public']['Tables']['profiles']['Row'];

async function getProfileData(): Promise<Profile | null> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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
        console.error("Fatal: Could not find profile for a logged-in user.", { userId: user.id, error });
        return null;
    }
    
    return profile;
}


export default async function ProfilPage() {
  const profile = await getProfileData();

  if (!profile) {
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
            <Suspense fallback={<Loading />}>
                <ProfileClient profile={profile} />
            </Suspense>
        </CardContent>
    </Card>
  );
}
