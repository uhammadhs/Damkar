
"use client"

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast'
import { editMember } from './actions'
import type { Profile } from './page'

interface EditMemberDialogProps {
  member: Profile;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({ member, isOpen, onOpenChange }: EditMemberDialogProps) {
  const { toast } = useToast()
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.append('id', member.id) // Add member ID to form data
    
    const result = await editMember(formData)

    if (result.success) {
      toast({
        title: "Sukses",
        description: result.message,
      })
      onOpenChange(false)
    } else {
      toast({
        title: "Gagal",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Data Anggota</DialogTitle>
          <DialogDescription>
            Perbarui detail anggota. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <form id="edit-member-form" ref={formRef} onSubmit={handleEditSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Nama</Label>
            <Input id="edit-name" name="name" defaultValue={member.name || ''} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-nip" className="text-right">NIP</Label>
            <Input id="edit-nip" name="nip" defaultValue={member.nip || ''} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-pangkat" className="text-right">Pangkat</Label>
            <Input id="edit-pangkat" name="pangkat" defaultValue={member.pangkat || ''} className="col-span-3" required />
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
            <Button type="button" variant="secondary">Batal</Button>
          </DialogClose>
          <Button type="submit" form="edit-member-form">Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
