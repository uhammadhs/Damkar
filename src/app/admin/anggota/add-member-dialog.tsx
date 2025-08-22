
"use client"

import * as React from 'react'
import { Plus, Loader2 } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleAddSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    setIsSubmitting(true)
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
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
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
            <Label htmlFor="id_pjlp" className="text-right">ID PJLP</Label>
            <Input id="id_pjlp" name="id_pjlp" className="col-span-3" placeholder="Contoh: 123456789" required />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Nomor HP</Label>
            <Input id="phone" name="phone" className="col-span-3" placeholder="0812xxxxxxxx" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" className="col-span-3" placeholder="Untuk login & notifikasi" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input id="password" name="password" type="password" className="col-span-3" placeholder="••••••••" required />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>Batal</Button>
          </DialogClose>
          <Button type="submit" form="add-member-form" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {isSubmitting ? 'Menyimpan...' : 'Simpan Anggota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
