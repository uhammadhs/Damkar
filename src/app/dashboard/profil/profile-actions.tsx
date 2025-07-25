
"use client"

import * as React from "react";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
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
import { changePassword, updateProfile } from "./actions";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileActionsProps {
    profile: Profile;
}

export function ProfileActions({ profile }: ProfileActionsProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const { toast } = useToast();

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);

    if (result.success) {
      setIsEditProfileOpen(false);
      toast({
        title: "Sukses",
        description: result.message,
      });
      // No need to optimistically update, revalidatePath will handle it.
    } else {
        toast({
            title: "Gagal",
            description: result.message,
            variant: "destructive",
        });
    }
  };
  
  const handleChangePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await changePassword(formData);
    
    if (result.success) {
        setIsChangePasswordOpen(false);
        (event.target as HTMLFormElement).reset();
        toast({
            title: "Sukses",
            description: result.message,
        });
    } else {
        toast({
            title: "Gagal",
            description: result.message,
            variant: "destructive",
        });
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogTrigger asChild>
          <Button>Edit Profil</Button>
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
              <Input id="name" name="name" defaultValue={profile.name || ''} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nip" className="text-right">NIP</Label>
              <Input id="nip" name="nip" defaultValue={profile.nip || ''} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pangkat" className="text-right">Pangkat</Label>
              <Input id="pangkat" name="pangkat" defaultValue={profile.pangkat || ''} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="golongan" className="text-right">Golongan</Label>
              <Input id="golongan" name="golongan" defaultValue={profile.golongan || ''} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jabatan" className="text-right">Jabatan</Label>
              <Input id="jabatan" name="jabatan" defaultValue={profile.jabatan || ''} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="satuanKerja" className="text-right">Satuan Kerja</Label>
              <Input id="satuanKerja" name="satuanKerja" defaultValue={profile.satuanKerja || ''} className="col-span-3" />
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
          <Button variant="outline">Ubah Password</Button>
        </DialogTrigger>
        <DialogContent>
           <DialogHeader>
            <DialogTitle className="font-headline">Ubah Password</DialogTitle>
            <DialogDescription>
              Untuk keamanan, pastikan menggunakan password yang kuat. Password baru minimal 6 karakter.
            </DialogDescription>
          </DialogHeader>
          <form id="change-password-form" onSubmit={handleChangePasswordSubmit} className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">Password Baru</Label>
              <Input id="new-password" name="new-password" type="password" className="col-span-3" placeholder="••••••••" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password" className="text-right">Konfirmasi</Label>
              <Input id="confirm-password" name="confirm-password" type="password" className="col-span-3" placeholder="••••••••" required/>
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
  );
}
