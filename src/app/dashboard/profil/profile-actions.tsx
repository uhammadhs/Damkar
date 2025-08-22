
"use client"

import * as React from "react";
import type { Database } from "@/types/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { useToast } from "@/hooks/use-toast";
import { changePassword, updateProfile } from "./actions";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


type Profile = Database['public']['Tables']['profiles']['Row'];

// Schema is now defined in the client component where it is used.
const ProfileUpdateSchema = z.object({
  name: z.string().min(3, "Nama lengkap harus diisi (minimal 3 karakter)"),
  id_pjlp: z.string().min(1, "ID PJLP tidak boleh kosong"),
  phone: z.string().min(10, "Nomor HP tidak valid (minimal 10 digit)").optional(),
});
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
        mode: "onChange", // Validate on change for instant feedback
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
        <Dialog open={isOpen} onOpenChange={(open) => {
            onOpenChange(open);
            // Reset form when dialog is closed
            if (!open) {
                form.reset({
                    name: profile.name || "",
                    id_pjlp: profile.id_pjlp || "",
                    phone: profile.phone || "",
                })
            }
        }}>
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
                    <form id="edit-profile-form" onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="id_pjlp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID PJLP</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomor HP</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
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
                <form id="change-password-form" ref={formRef} onSubmit={handleChangePasswordSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <FormLabel htmlFor="new_password">Password Baru</FormLabel>
                        <Input id="new_password" name="new_password" type="password" placeholder="••••••••" required/>
                    </div>
                    <div className="space-y-2">
                        <FormLabel htmlFor="confirm_password">Konfirmasi</FormLabel>
                        <Input id="confirm_password" name="confirm_password" type="password" placeholder="••••••••" required/>
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
    <div className="flex flex-col gap-2 pt-4 sm:flex-row">
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
