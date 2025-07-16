
"use client"

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const initialProfile = {
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
  const [profile, setProfile] = React.useState(initialProfile);
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const { toast } = useToast();

  const handleProfileUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedProfile = {
      ...profile,
      name: formData.get("name") as string,
      nip: formData.get("nip") as string,
      pangkat: formData.get("pangkat") as string,
      golongan: formData.get("golongan") as string,
      jabatan: formData.get("jabatan") as string,
      satuanKerja: formData.get("satuanKerja") as string,
    };
    setProfile(updatedProfile);
    setIsEditProfileOpen(false);
    toast({
      title: "Sukses",
      description: "Profil Anda telah berhasil diperbarui.",
    });
  };
  
  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Password change logic would go here
    setIsChangePasswordOpen(false);
     toast({
      title: "Sukses",
      description: "Password Anda telah berhasil diubah.",
    });
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
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="male portrait" />
            <AvatarFallback>{profile.avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p className="font-semibold">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIP</p>
                <p className="font-semibold">{profile.nip}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pangkat</p>
                <p className="font-semibold">{profile.pangkat}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Golongan</p>
                <p className="font-semibold">{profile.golongan}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                <p className="font-semibold">{profile.jabatan}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Satuan Kerja</p>
                <p className="font-semibold">{profile.satuanKerja}</p>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button>
                    Edit Profil
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-headline">Edit Profil</DialogTitle>
                    <DialogDescription>
                      Lakukan perubahan pada data profil Anda. Klik simpan jika sudah selesai.
                    </DialogDescription>
                  </DialogHeader>
                  <form id="edit-profile-form" onSubmit={handleProfileUpdate} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Nama</Label>
                      <Input id="name" name="name" defaultValue={profile.name} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nip" className="text-right">NIP</Label>
                      <Input id="nip" name="nip" defaultValue={profile.nip} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pangkat" className="text-right">Pangkat</Label>
                      <Input id="pangkat" name="pangkat" defaultValue={profile.pangkat} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="golongan" className="text-right">Golongan</Label>
                      <Input id="golongan" name="golongan" defaultValue={profile.golongan} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="jabatan" className="text-right">Jabatan</Label>
                      <Input id="jabatan" name="jabatan" defaultValue={profile.jabatan} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="satuanKerja" className="text-right">Satuan Kerja</Label>
                      <Input id="satuanKerja" name="satuanKerja" defaultValue={profile.satuanKerja} className="col-span-3" />
                    </div>
                  </form>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Batal</Button>
                    </DialogClose>
                    <Button type="submit" form="edit-profile-form">Simpan Perubahan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Ubah Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                   <DialogHeader>
                    <DialogTitle className="font-headline">Ubah Password</DialogTitle>
                    <DialogDescription>
                      Untuk keamanan, pastikan menggunakan password yang kuat.
                    </DialogDescription>
                  </DialogHeader>
                  <form id="change-password-form" onSubmit={handleChangePassword} className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="old-password" className="text-right">Password Lama</Label>
                      <Input id="old-password" type="password" className="col-span-3" placeholder="••••••••" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-password" className="text-right">Password Baru</Label>
                      <Input id="new-password" type="password" className="col-span-3" placeholder="••••••••" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirm-password" className="text-right">Konfirmasi</Label>
                      <Input id="confirm-password" type="password" className="col-span-3" placeholder="••••••••" />
                    </div>
                  </form>
                   <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Batal</Button>
                    </DialogClose>
                    <Button type="submit" form="change-password-form">Simpan Password</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
