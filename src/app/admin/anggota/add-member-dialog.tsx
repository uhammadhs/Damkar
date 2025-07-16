
"use client"

import * as React from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast'
import { addMember } from './actions'

export function AddMemberDialog() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const { toast } = useToast()
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleAddSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const result = await addMember(formData)

    if (result.success) {
      toast({
        title: "Sukses",
        description: result.message,
      })
      setIsAddDialogOpen(false)
      formRef.current?.reset()
    } else {
      toast({
        title: "Gagal",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Tambah Anggota
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Isi detail anggota untuk membuat akun baru.
          </DialogDescription>
        </DialogHeader>
        <form id="add-member-form" ref={formRef} onSubmit={handleAddSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nama</Label>
            <Input id="name" name="name" className="col-span-3" placeholder="Contoh: Budi" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nip" className="text-right">NIP</Label>
            <Input id="nip" name="nip" className="col-span-3" placeholder="Contoh: 199505052020121005" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pangkat" className="text-right">Pangkat</Label>
            <Input id="pangkat" name="pangkat" className="col-span-3" placeholder="Contoh: Analis Kebakaran" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" className="col-span-3" placeholder="Untuk login" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input id="password" name="password" type="password" className="col-span-3" placeholder="••••••••" required />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Batal</Button>
          </DialogClose>
          <Button type="submit" form="add-member-form">Simpan Anggota</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
