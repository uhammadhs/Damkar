
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
  { id: 1, name: "Anggota Damkar 1", nip: "199001012020121001", pangkat: "Pranata Komputer Ahli Pertama", username: "anggota1", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A1" },
  { id: 2, name: "Anggota Damkar 2", nip: "199102022020121002", pangkat: "Analis Kebakaran", username: "anggota2", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A2" },
  { id: 3, name: "Anggota Damkar 3", nip: "199203032020121003", pangkat: "Pemadam Kebakaran Pelaksana", username: "anggota3", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A3" },
  { id: 4, name: "Anggota Damkar 4", nip: "199304042020121004", pangkat: "Pranata Komputer Ahli Pertama", username: "anggota4", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A4" },
];

type Member = typeof initialMembers[0];

export default function AnggotaPage() {
  const [members, setMembers] = React.useState<Member[]>(initialMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const nip = formData.get("nip") as string;
    const pangkat = formData.get("pangkat") as string;
    const username = formData.get("username") as string;
    
    if (!name || !nip || !pangkat || !username) {
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
      username,
      avatarUrl: `https://placehold.co/40x40.png`,
      avatarFallback: name.substring(0, 2).toUpperCase(),
    };

    setMembers(prev => [...prev, newMember]);
    setIsAddDialogOpen(false);
    (event.target as HTMLFormElement).reset();
    toast({
        title: "Sukses",
        description: `Anggota baru "${name}" berhasil ditambahkan.`,
    });
  };

  const handleEditMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMember) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const nip = formData.get("nip") as string;
    const pangkat = formData.get("pangkat") as string;
    const username = formData.get("username") as string;
    
    if (!name || !nip || !pangkat || !username) {
        toast({
            title: "Gagal",
            description: "Semua field harus diisi.",
            variant: "destructive",
        });
        return;
    }

    setMembers(prev => 
      prev.map(member => 
        member.id === editingMember.id ? { ...member, name, nip, pangkat, username } : member
      )
    );
    
    setIsEditDialogOpen(false);
    setEditingMember(null);
    toast({
        title: "Sukses",
        description: `Data anggota "${name}" berhasil diperbarui.`,
    });
  };

  const handleDeleteMember = (id: number) => {
    setMembers(prev => prev.filter(member => member.id !== id));
    toast({
      title: "Sukses",
      description: "Anggota telah dihapus.",
    });
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.nip.includes(searchTerm) ||
    member.pangkat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari anggota..." 
                      className="pl-8 sm:w-auto"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                Isi detail anggota untuk membuat akun baru.
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
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">Username</Label>
                                <Input id="username" name="username" className="col-span-3" placeholder="Untuk login" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <Input id="password" name="password" type="password" className="col-span-3" placeholder="••••••••" />
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
                <TableHead className="hidden sm:table-cell">NIP</TableHead>
                <TableHead className="hidden md:table-cell">Pangkat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="male portrait" />
                          <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{member.pangkat}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{member.nip}</TableCell>
                  <TableCell className="hidden md:table-cell">{member.pangkat}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(member)}>Edit</DropdownMenuItem>
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
        {filteredMembers.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            {searchTerm ? "Anggota tidak ditemukan." : "Tidak ada anggota yang terdaftar."}
          </p>
        )}
      </CardContent>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
              <DialogTitle className="font-headline">Edit Data Anggota</DialogTitle>
              <DialogDescription>
                  Perbarui detail anggota. Klik simpan jika sudah selesai.
              </DialogDescription>
          </DialogHeader>
          <form id="edit-member-form" onSubmit={handleEditMember} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nama</Label>
                  <Input id="edit-name" name="name" defaultValue={editingMember?.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-nip" className="text-right">NIP</Label>
                  <Input id="edit-nip" name="nip" defaultValue={editingMember?.nip} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-pangkat" className="text-right">Pangkat</Label>
                  <Input id="edit-pangkat" name="pangkat" defaultValue={editingMember?.pangkat} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right">Username</Label>
                  <Input id="edit-username" name="username" defaultValue={editingMember?.username} className="col-span-3" />
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
    </Card>
  );
}
