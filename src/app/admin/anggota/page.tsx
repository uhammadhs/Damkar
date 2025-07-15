
"use client"

import * as React from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const initialMembers = [
  { id: 1, name: "Anggota Damkar 1", nip: "199001012020121001", pangkat: "Pranata Komputer Ahli Pertama", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A1" },
  { id: 2, name: "Anggota Damkar 2", nip: "199102022020121002", pangkat: "Analis Kebakaran", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A2" },
  { id: 3, name: "Anggota Damkar 3", nip: "199203032020121003", pangkat: "Pemadam Kebakaran Pelaksana", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A3" },
  { id: 4, name: "Anggota Damkar 4", nip: "199304042020121004", pangkat: "Pranata Komputer Ahli Pertama", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A4" },
];

type Member = typeof initialMembers[0];

export default function AnggotaPage() {
  const [members, setMembers] = React.useState<Member[]>(initialMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const nip = formData.get("nip") as string;
    const pangkat = formData.get("pangkat") as string;

    if (!name || !nip || !pangkat) {
        toast({
            title: "Gagal",
            description: "Semua field harus diisi.",
            variant: "destructive",
        });
        return;
    }

    const newMember: Member = {
      id: members.length + 1,
      name,
      nip,
      pangkat,
      avatarUrl: `https://placehold.co/40x40.png`,
      avatarFallback: name.substring(0, 2).toUpperCase(),
    };

    setMembers(prev => [...prev, newMember]);
    setIsAddDialogOpen(false);
    toast({
        title: "Sukses",
        description: "Anggota baru berhasil ditambahkan.",
    });
  };

  const handleDeleteMember = (id: number) => {
    setMembers(prev => prev.filter(member => member.id !== id));
    toast({
      title: "Sukses",
      description: "Anggota telah dihapus.",
      variant: "destructive"
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="font-headline">Manajemen Anggota</CardTitle>
                <CardDescription>Tambah, edit, atau hapus data anggota.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari anggota..." className="pl-8 sm:w-auto" />
                </div>
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
                                Isi detail anggota untuk menambahkannya ke sistem.
                            </DialogDescription>
                        </DialogHeader>
                        <form id="add-member-form" onSubmit={handleAddMember} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nama</Label>
                                <Input id="name" name="name" className="col-span-3" placeholder="Contoh: Budi" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nip" className="text-right">NIP</Label>
                                <Input id="nip" name="nip" className="col-span-3" placeholder="Contoh: 199505052020121005" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="pangkat" className="text-right">Pangkat</Label>
                                <Input id="pangkat" name="pangkat" className="col-span-3" placeholder="Contoh: Analis Kebakaran" />
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
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">NIP</TableHead>
                <TableHead>Pangkat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="male portrait" />
                          <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{member.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{member.nip}</TableCell>
                  <TableCell>{member.pangkat}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMember(member.id)}>
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {members.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            Tidak ada anggota yang terdaftar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
