
"use client"

import * as React from "react";
import type { Database } from "@/types/supabase";
import { useFormStatus, useActionState } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

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
import { changePassword, updateProfile, type FormState } from "./actions";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


type Profile = Database['public']['Tables']['profiles']['Row'];

// Schema is defined in the client component where it is used by React Hook Form.
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
    const formRef = React.useRef<HTMLFormElement>(null);

    const initialState: FormState = { success: false, message: "", errors: null };
    const [state, formAction] = useActionState(updateProfile, initialState);
    
    // Effect to handle toast notifications and dialog closing on success
    React.useEffect(() => {
        if (state.success) {
            toast({
                title: "Sukses",
                description: state.message,
            });
            onOpenChange(false);
        } else if (state.message && !state.errors) {
            // Handle general, non-field-specific errors from the server
            toast({
                title: "Gagal",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state, toast, onOpenChange]);

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
                <form ref={formRef} action={formAction} className="space-y-4 py-4">
                    {/* Display general errors */}
                    {state?.message && !state.success && !state.errors && (
                         <p className="text-sm font-medium text-destructive">{state.message}</p>
                    )}
                    
                    <div className="space-y-2">
                        <FormLabel htmlFor="name">Nama</FormLabel>
                        <Input id="name" name="name" defaultValue={profile.name || ''} />
                        {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                    </div>

                     <div className="space-y-2">
                        <FormLabel htmlFor="id_pjlp">ID PJLP</FormLabel>
                        <Input id="id_pjlp" name="id_pjlp" defaultValue={profile.id_pjlp || ''} />
                        {state?.errors?.id_pjlp && <p className="text-sm font-medium text-destructive">{state.errors.id_pjlp[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <FormLabel htmlFor="phone">Nomor HP</FormLabel>
                        <Input id="phone" name="phone" defaultValue={profile.phone || ''} />
                        {state?.errors?.phone && <p className="text-sm font-medium text-destructive">{state.errors.phone[0]}</p>}
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Batal</Button>
                    </DialogClose>
                    <Button type="submit" formAction={formAction} form={formRef.current?.id} onClick={() => formRef.current?.requestSubmit()}>
                         Simpan Perubahan
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
