
'use server'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MemberActions } from "./member-actions";
import { MoreHorizontal, Users } from "lucide-react";
import type { Profile } from "./page";
import { AddMemberDialog } from "./add-member-dialog";

const getAvatarFallback = (name: string | null) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export async function MemberTable({ profiles, query }: { profiles: Profile[], query: string }) {

    if (profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-xl font-semibold font-headline">Belum Ada Anggota</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {query ? `Tidak ada anggota yang cocok dengan pencarian "${query}".` : 'Anda belum memiliki anggota. Tambahkan anggota pertama untuk memulai.'}
                </p>
                <div className="mt-6">
                    <AddMemberDialog />
                </div>
            </div>
        );
    }


    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden sm:table-cell">ID PJLP</TableHead>
                        <TableHead className="hidden md:table-cell">Nomor HP</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} data-ai-hint="male portrait" />
                                        <AvatarFallback>{getAvatarFallback(profile.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <div className="font-medium">{profile.name || 'No Name'}</div>
                                        <div className="text-sm text-muted-foreground md:hidden">{profile.id_pjlp}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{profile.id_pjlp}</TableCell>
                            <TableCell className="hidden md:table-cell">{profile.phone}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <MemberActions member={profile} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

    