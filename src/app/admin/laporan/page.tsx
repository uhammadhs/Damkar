
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const memberLeaveData = [
  { id: 1, name: "Anggota Damkar 1", nip: "199001012020121001", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A1", jatahCuti: 12, cutiTerpakai: 5 },
  { id: 2, name: "Anggota Damkar 2", nip: "199102022020121002", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A2", jatahCuti: 12, cutiTerpakai: 10 },
  { id: 3, name: "Anggota Damkar 3", nip: "199203032020121003", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A3", jatahCuti: 12, cutiTerpakai: 2 },
  { id: 4, name: "Anggota Damkar 4", nip: "199304042020121004", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A4", jatahCuti: 12, cutiTerpakai: 7 },
  { id: 5, name: "Anggota Damkar 5", nip: "199405052020121005", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A5", jatahCuti: 12, cutiTerpakai: 0 },
  { id: 6, name: "Anggota Damkar 6", nip: "199506062020121006", avatarUrl: "https://placehold.co/40x40.png", avatarFallback: "A6", jatahCuti: 12, cutiTerpakai: 12 },
];

export default function LaporanPage() {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredData = memberLeaveData.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.nip.includes(searchTerm)
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau NIP..."
                            className="pl-8 sm:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 {/* Mobile View: List of Cards */}
                 <div className="space-y-4 md:hidden">
                    {filteredData.map((member) => {
                         const sisaCuti = member.jatahCuti - member.cutiTerpakai;
                         const progressValue = (member.cutiTerpakai / member.jatahCuti) * 100;
                        return (
                            <Card key={member.id}>
                                <CardHeader className="flex flex-row items-center gap-4 p-4">
                                     <Avatar>
                                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="male portrait" />
                                        <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{member.name}</CardTitle>
                                        <CardDescription>{member.nip}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                     <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Jatah</span>
                                            <span className="font-medium">{member.jatahCuti} hari</span>
                                        </div>
                                         <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Terpakai</span>
                                            <span className="font-medium">{member.cutiTerpakai} hari</span>
                                        </div>
                                         <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Sisa</span>
                                            <span className="font-bold text-primary">{sisaCuti} hari</span>
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex flex-col items-center gap-1">
                                        <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% cuti terpakai`} />
                                        <span className="text-xs text-muted-foreground">Penggunaan: {member.cutiTerpakai}/{member.jatahCuti} Hari</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden overflow-x-auto md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Nama Anggota</TableHead>
                                <TableHead className="hidden md:table-cell">NIP</TableHead>
                                <TableHead className="text-center">Jatah Cuti</TableHead>
                                <TableHead className="text-center">Cuti Terpakai</TableHead>
                                <TableHead className="text-center">Sisa Cuti</TableHead>
                                <TableHead className="w-[200px] text-center">Penggunaan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((member) => {
                                const sisaCuti = member.jatahCuti - member.cutiTerpakai;
                                const progressValue = (member.cutiTerpakai / member.jatahCuti) * 100;

                                return (
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
                                        <TableCell className="text-center font-medium">{member.jatahCuti}</TableCell>
                                        <TableCell className="text-center font-medium">{member.cutiTerpakai}</TableCell>
                                        <TableCell className="text-center font-bold text-primary">{sisaCuti}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-center gap-1">
                                                <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% cuti terpakai`} />
                                                <span className="text-xs text-muted-foreground">{member.cutiTerpakai}/{member.jatahCuti} Hari</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {filteredData.length === 0 && (
                    <p className="py-10 text-center text-muted-foreground">
                        Anggota tidak ditemukan.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
