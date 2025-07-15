import { Plus, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"


const members = [
  { id: 1, name: "Anggota Damkar 1", nip: "199001012020121001", pangkat: "Pranata Komputer Ahli Pertama", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A1" },
  { id: 2, name: "Anggota Damkar 2", nip: "199102022020121002", pangkat: "Analis Kebakaran", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A2" },
  { id: 3, name: "Anggota Damkar 3", nip: "199203032020121003", pangkat: "Pemadam Kebakaran Pelaksana", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A3" },
  { id: 4, name: "Anggota Damkar 4", nip: "199304042020121004", pangkat: "Pranata Komputer Ahli Pertama", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A4" },
];

export default function AnggotaPage() {
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
                <Button>
                    <Plus />
                    Tambah Anggota
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
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
                      <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
