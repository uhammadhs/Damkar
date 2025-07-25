
import { createClient } from "@/lib/supabase/server";
import { LaporanClient } from "./laporan-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export type MemberLeaveData = {
    id: string;
    name: string | null;
    nip: string | null;
    avatar_url: string | null;
    total_days: number;
    used_days: number;
    year: number;
}

async function getLeaveBalancesForYear(year: number) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('leave_balances')
        .select(`
            year,
            total_days,
            used_days,
            profiles!inner (id, name, nip, avatar_url, role)
        `)
        .eq('profiles.role', 'anggota')
        .eq('year', year)
        .order('name', { referencedTable: 'profiles', ascending: true });

    if (error) {
        console.error("Error fetching leave balances for report:", error);
        return [];
    }
    
    const formattedData = data.map(item => ({
        id: item.profiles!.id,
        name: item.profiles!.name,
        nip: item.profiles!.nip,
        avatar_url: item.profiles!.avatar_url,
        total_days: item.total_days,
        used_days: item.used_days,
        year: item.year,
    }));
        
    return formattedData;
}

async function getAvailableYears() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('leave_balances')
        .select('year')
        .order('year', { ascending: false });

    if (error || !data) return [];
    return Array.from(new Set(data.map(d => d.year)));
}

const getAvatarFallback = (name: string | null) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default async function LaporanPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    year?: string;
  };
}) {
    const availableYears = await getAvailableYears();
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(searchParams?.year) || (availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear);
    const data = await getLeaveBalancesForYear(selectedYear);
    
    return (
        <Card>
            <CardHeader>
                <LaporanClient availableYears={availableYears} selectedYear={selectedYear} />
            </CardHeader>
            <CardContent>
                {/* Mobile View: List of Cards */}
                <div className="space-y-4 md:hidden">
                    {data.map((member) => {
                        const sisaCuti = member.total_days - member.used_days;
                        const progressValue = member.total_days > 0 ? (member.used_days / member.total_days) * 100 : 0;
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
                            {data.map((member) => {
                                const sisaCuti = member.total_days - member.used_days;
                                const progressValue = member.total_days > 0 ? (member.used_days / member.total_days) * 100 : 0;
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

                {data.length === 0 && (
                    <p className="py-10 text-center text-muted-foreground">
                        Tidak ada data untuk tahun yang dipilih.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
