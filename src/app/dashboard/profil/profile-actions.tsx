"use client"

import * as React from "react";
import { useActionState } from "react";
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
import { changePassword, updateProfile, type FormState } from "./actions";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileActionsProps {
    profile: Profile;
}

function EditProfileSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
    )
}

function EditProfileDialog({ profile, isOpen, onOpenChange }: { profile: Profile, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const initialState: FormState = { success: false, message: "" };
    const [state, formAction] = useActionState(updateProfile, initialState);

    React.useEffect(() => {
        if (state.success) {
            toast({
                title: "Sukses",
                description: state.message,
            });
            onOpenChange(false);
        } else if (state.message && !state.errors) {
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
                <form action={formAction} className="space-y-4 py-4">
                    {state?.message && !state.success && !state.errors && (
                         <p className="text-sm font-medium text-destructive">{state.message}</p>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" name="name" defaultValue={profile.name || ''} />
                        {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="id_pjlp">ID PJLP</Label>
                        <Input id="id_pjlp" name="id_pjlp" defaultValue={profile.id_pjlp || ''} />
                        {state?.errors?.id_pjlp && <p className="text-sm font-medium text-destructive">{state.errors.id_pjlp[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Nomor HP</Label>
                        <Input id="phone" name="phone" defaultValue={profile.phone || ''} />
                        {state?.errors?.phone && <p className="text-sm font-medium text-destructive">{state.errors.phone[0]}</p>}
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Batal</Button>
                        </DialogClose>
                        <EditProfileSubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ChangePasswordDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
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
                        <Label htmlFor="new_password">Password Baru</Label>
                        <div className="relative">
                            <Input 
                                id="new_password" 
                                name="new_password" 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                required
                                className="pr-10"
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm_password">Konfirmasi</Label>
                        <div className="relative">
                            <Input 
                                id="confirm_password" 
                                name="confirm_password" 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                required
                                className="pr-10"
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                        </div>
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
