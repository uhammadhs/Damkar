
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileActions } from "./profile-actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileSkeleton() {
    return (
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                    ))}
                </div>
                <Separator className="my-6" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    )
}

async function ProfileData() {
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
        console.error("Fatal: Could not find profile for a logged-in user.", { userId: user.id, error });
        return <div>Tidak dapat memuat profil. Sesuatu yang kritis salah. Silakan hubungi admin.</div>;
    }

    const getAvatarFallback = (name: string | null) => {
        if (!name) return "??";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} data-ai-hint="male portrait" />
            <AvatarFallback>{getAvatarFallback(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p className="font-semibold">{profile.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID PJLP</p>
                <p className="font-semibold">{profile.id_pjlp || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nomor HP</p>
                <p className="font-semibold">{profile.phone || "-"}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">{profile.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Golongan</p>
                <p className="font-semibold">{profile.golongan || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                <p className="font-semibold">{profile.jabatan || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Satuan Kerja</p>
                <p className="font-semibold">{profile.satuanKerja || "-"}</p>
              </div>
            </div>
            <Separator className="my-6" />
            <ProfileActions profile={profile} />
          </div>
        </div>
    )
}

export default async function ProfilPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Profil Anggota</CardTitle>
        <CardDescription>
          Informasi pribadi dan pengaturan akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <Suspense fallback={<ProfileSkeleton />}>
              <ProfileData />
          </Suspense>
      </CardContent>
    </Card>
  );
}
