
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client";

type MemberLeaveData = {
    id: string;
    name: string | null;
    nip: string | null;
    avatar_url: string | null;
    total_days: number;
    used_days: number;
}

export default function LaporanPage() {
    const supabase = createClient();
    const [memberLeaveData, setMemberLeaveData] = React.useState<MemberLeaveData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);

    React.useEffect(() => {
        const fetchLeaveBalances = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('leave_balances')
                .select(`
                    total_days,
                    used_days,
                    profiles (id, name, nip, avatar_url)
                `)
                .eq('year', selectedYear);

            if (error) {
                console.error("Error fetching leave balances for report:", error);
                setMemberLeaveData([]);
            } else if (data) {
                const formattedData = data.map(item => ({
                    id: item.profiles!.id,
                    name: item.profiles!.name,
                    nip: item.profiles!.nip,
                    avatar_url: item.profiles!.avatar_url,
                    total_days: item.total_days,
                    used_days: item.used_days,
                }));
                setMemberLeaveData(formattedData);
            }
            setLoading(false);
        };

        fetchLeaveBalances();
    }, [selectedYear, supabase]);

    const getAvatarFallback = (name: string | null) => {
        if (!name) return "??";
        const parts = name.split(" ");
        if (parts.length > 1) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };
      
    // In a real app, years would come from the data
    const availableYears = [currentYear, currentYear - 1, currentYear - 2];

    const filteredData = memberLeaveData.filter(member =>
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.nip && member.nip.includes(searchTerm))
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau NIP..."
                            className="pl-8 sm:w-[250px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                             {availableYears.map(year => (
                                <SelectItem key={year} value={String(year)}>Tahun {year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                 {loading ? (
                    <p className="py-10 text-center text-muted-foreground">Memuat data laporan...</p>
                 ) : (
                    <>
                    {/* Mobile View: List of Cards */}
                    <div className="space-y-4 md:hidden">
                        {filteredData.map((member) => {
                            const sisaCuti = member.total_days - member.used_days;
                            const progressValue = (member.used_days / member.total_days) * 100;
                            return (
                                <Card key={member.id}>
                                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                                        <Avatar>
                                            <AvatarImage src={member.avatar_url || ''} alt={member.name || 'avatar'} data-ai-hint="male portrait" />
                                            <AvatarFallback>{getAvatarFallback(member.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-base font-semibold">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.nip}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Jatah</span>
                                                <span className="font-medium">{member.total_days} hari</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Terpakai</span>
                                                <span className="font-medium">{member.used_days} hari</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Sisa</span>
                                                <span className="font-bold text-primary">{sisaCuti} hari</span>
                                            </div>
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="flex flex-col items-center gap-1">
                                            <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% cuti terpakai`} />
                                            <span className="text-xs text-muted-foreground">Penggunaan: {member.used_days}/{member.total_days} Hari</span>
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
                                    const sisaCuti = member.total_days - member.used_days;
                                    const progressValue = (member.used_days / member.total_days) * 100;

                                    return (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                                        <AvatarImage src={member.avatar_url || ''} alt={member.name || 'avatar'} data-ai-hint="male portrait" />
                                                        <AvatarFallback>{getAvatarFallback(member.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium">{member.name}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{member.nip}</TableCell>
                                            <TableCell className="text-center font-medium">{member.total_days}</TableCell>
                                            <TableCell className="text-center font-medium">{member.used_days}</TableCell>
                                            <TableCell className="text-center font-bold text-primary">{sisaCuti}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col items-center gap-1">
                                                    <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% cuti terpakai`} />
                                                    <span className="text-xs text-muted-foreground">{member.used_days}/{member.total_days} Hari</span>
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
                            Anggota tidak ditemukan atau tidak ada data untuk tahun yang dipilih.
                        </p>
                    )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
