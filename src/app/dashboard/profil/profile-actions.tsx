
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
import { Loader2 } from "lucide-react";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileActionsProps {
    profile: Profile;
}

export function ProfileActions({ profile }: ProfileActionsProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  const { toast } = useToast();

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);

    if (result.success) {
      setIsEditProfileOpen(false);
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
    setIsSaving(false);
  };
  
  const handleChangePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsChangingPassword(true);
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
    setIsChangingPassword(false);
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
              <Input id="name" name="name" defaultValue={profile.name || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_pjlp" className="text-right">ID PJLP</Label>
              <Input id="id_pjlp" name="id_pjlp" defaultValue={profile.id_pjlp || ''} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Nomor HP</Label>
              <Input id="phone" name="phone" defaultValue={profile.phone || ''} className="col-span-3" required />
            </div>
          </form>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSaving}>Batal</Button>
            </DialogClose>
            <Button type="submit" form="edit-profile-form" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
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
              <Button type="button" variant="secondary" disabled={isChangingPassword}>Batal</Button>
            </DialogClose>
            <Button type="submit" form="change-password-form" disabled={isChangingPassword}>
              {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isChangingPassword ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    