import Image from "next/image";
import { Edit, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const userProfile = {
  name: "Anggota Damkar",
  nip: "199001012020121001",
  pangkat: "Pranata Komputer Ahli Pertama",
  golongan: "III/b",
  jabatan: "Analis Sistem",
  satuanKerja: "Dinas Pemadam Kebakaran dan Penyelamatan",
  avatarUrl: "https://placehold.co/128x128.png",
  avatarFallback: "AD",
};

export default function ProfilPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Profil Anggota</CardTitle>
        <CardDescription>
          Informasi pribadi dan pengaturan akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="male portrait" />
            <AvatarFallback>{userProfile.avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p className="font-semibold">{userProfile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIP</p>
                <p className="font-semibold">{userProfile.nip}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pangkat</p>
                <p className="font-semibold">{userProfile.pangkat}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Golongan</p>
                <p className="font-semibold">{userProfile.golongan}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                <p className="font-semibold">{userProfile.jabatan}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Satuan Kerja</p>
                <p className="font-semibold">{userProfile.satuanKerja}</p>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button>
                    <Edit />
                    Edit Profil
                </Button>
                <Button variant="outline">
                    <ShieldCheck />
                    Ubah Password
                </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
