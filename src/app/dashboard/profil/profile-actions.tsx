
"use client"

import * as React from "react";
import type { Database } from "@/types/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

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
import { changePassword, updateProfile, ProfileUpdateSchema } from "./actions";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileFormData = z.infer<typeof ProfileUpdateSchema>;

interface ProfileActionsProps {
    profile: Profile;
}


function EditProfileDialog({ profile, isOpen, onOpenChange }: { profile: Profile, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const form = useForm<ProfileFormData>({
        resolver: zodResolver(ProfileUpdateSchema),
        defaultValues: {
            name: profile.name || "",
            id_pjlp: profile.id_pjlp || "",
            phone: profile.phone || "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const handleProfileUpdate = async (values: ProfileFormData) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });

        const result = await updateProfile(formData);

        if (result.success) {
            onOpenChange(false);
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
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                 <Form {...form}>
                    <form id="edit-profile-form" onSubmit={form.handleSubmit(handleProfileUpdate)} className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">Nama</FormLabel>
                                    <FormControl className="col-span-3">
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="id_pjlp"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">ID PJLP</FormLabel>
                                    <FormControl className="col-span-3">
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">Nomor HP</FormLabel>
                                    <FormControl className="col-span-3">
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isSubmitting}>Batal</Button>
                    </DialogClose>
                    <Button type="submit" form="edit-profile-form" disabled={isSubmitting || !isValid}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ChangePasswordDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleChangePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsChangingPassword(true);
        const formData = new FormData(event.currentTarget);
        const result = await changePassword(formData);
        
        if (result.success) {
            onOpenChange(false);
            formRef.current?.reset();
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
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">Ubah Password</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Ubah Password</DialogTitle>
                    <DialogDescription>
                        Untuk keamanan, pastikan menggunakan password yang kuat. Password baru minimal 6 karakter.
                    </DialogDescription>
                </DialogHeader>
                <form id="change-password-form" ref={formRef} onSubmit={handleChangePasswordSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new_password" className="text-right">Password Baru</Label>
                        <Input id="new_password" name="new_password" type="password" className="col-span-3" placeholder="••••••••" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="confirm_password" className="text-right">Konfirmasi</Label>
                        <Input id="confirm_password" name="confirm_password" type="password" className="col-span-3" placeholder="••••••••" required/>
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
    )
}


export function ProfileActions({ profile }: ProfileActionsProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <EditProfileDialog 
        profile={profile} 
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
      />
      <ChangePasswordDialog 
         isOpen={isChangePasswordOpen}
         onOpenChange={setIsChangePasswordOpen}
      />
    </div>
  );
}
