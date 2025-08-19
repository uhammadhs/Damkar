
"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast";
import { deleteMember, editMember } from "./actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Profile } from "./page";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function MemberActions({ member }: { member: Profile }) {
    const { toast } = useToast();
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus anggota ini? Aksi ini tidak dapat dibatalkan.")) {
          return;
        }
        setIsDeleting(true);
        const result = await deleteMember(member.id);
        if (result.success) {
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
        setIsDeleting(false);
    };

    const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        setIsSaving(true);
        const result = await editMember(formData);

        if (result.success) {
            toast({
                title: "Sukses",
                description: result.message,
            });
            setIsEditDialogOpen(false);
        } else {
            toast({
                title: "Gagal",
                description: result.message,
                variant: "destructive",
            });
        }
        setIsSaving(false);
    };
    
    return (
        <>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent key={member.id} className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle className="font-headline">Edit Data Anggota</DialogTitle>
                    <DialogDescription>
                        Perbarui detail anggota. Klik simpan jika sudah selesai.
                    </DialogDescription>
                    </DialogHeader>
                    <form id={`edit-member-form-${member.id}`} onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                        <input type="hidden" name="id" value={member.id} />
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Nama</Label>
                            <Input id="edit-name" name="name" defaultValue={member.name || ''} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-id_pjlp" className="text-right">ID PJLP</Label>
                            <Input id="edit-id_pjlp" name="id_pjlp" defaultValue={member.id_pjlp || ''} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-phone" className="text-right">Nomor HP</Label>
                            <Input id="edit-phone" name="phone" defaultValue={member.phone || ''} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">Email</Label>
                            <Input id="edit-email" name="email" defaultValue={member.email || ''} className="col-span-3" type="email" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-password" className="text-right">Password</Label>
                            <Input id="edit-password" name="password" type="password" className="col-span-3" placeholder="Kosongkan jika tidak berubah" />
                        </div>
                    </form>
                    <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isSaving}>Batal</Button>
                    </DialogClose>
                    <Button type="submit" form={`edit-member-form-${member.id}`} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                setIsEditDialogOpen(true)
            }}>
                Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onSelect={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isDeleting ? 'Menghapus...' : 'Hapus'}
            </DropdownMenuItem>
        </>
    )
}

    