
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LaporanClient } from './laporan-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Suspense } from 'react';
import Loading from './loading';

export const revalidate = 300; // Cache for 5 minutes

export type LeaveBalanceReport = {
    id: string;
    name: string | null;
    id_pjlp: string | null;
    total_days: number;
    used_days: number;
}

const getLeaveBalances = async (year: number, query: string, cookieStore: ReadonlyRequestCookies): Promise<LeaveBalanceReport[]> => {
    const supabase = createClient(cookieStore);
    
    let queryBuilder = supabase
        .from('profiles')
        .select(`
            id,
            name,
            id_pjlp,
            leave_balances (
                total_days,
                used_days
            )
        `)
        .eq('role', 'anggota')
        .eq('leave_balances.year', year);

    if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,id_pjlp.ilike.%${query}%`);
    }

    queryBuilder = queryBuilder.order('name', { ascending: true });

    const { data, error } = await queryBuilder;

    if (error) {
        console.error("Error fetching leave balances report:", error);
        return [];
    }

    // Process the data to flatten the structure and handle members without a balance entry
    return data.map(profile => {
        // 'leave_balances' will be an array. Since we filter by year, it will have 0 or 1 item.
        const balance = Array.isArray(profile.leave_balances) ? profile.leave_balances[0] : null;
        return {
            id: profile.id,
            name: profile.name,
            id_pjlp: profile.id_pjlp,
            total_days: balance?.total_days ?? 12, // Default to 12 if no entry
            used_days: balance?.used_days ?? 0,    // Default to 0 if no entry
        };
    });
}

const getAvailableYears = async (cookieStore: ReadonlyRequestCookies): Promise<number[]> => {
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('leave_balances')
        .select('year')
        .order('year', { ascending: false });

    if (error) {
        console.error("Error fetching available years:", error);
        return [new Date().getFullYear()];
    }

    const years = Array.from(new Set(data.map(item => item.year)));
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) {
        years.push(currentYear);
    }
    
    return years.sort((a, b) => b - a);
}

async function ReportData({ year, query }: { year: number, query: string }) {
    const cookieStore = cookies();
    const [balances, availableYears] = await Promise.all([
        getLeaveBalances(year, query, cookieStore),
        getAvailableYears(cookieStore)
    ]);
    
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="font-headline">Laporan Saldo Cuti</CardTitle>
                        <CardDescription>
                            Menampilkan rekapitulasi saldo cuti tahunan untuk setiap anggota.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <form className="w-full sm:w-auto">
                            <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="query"
                                placeholder="Cari nama atau id pjlp..."
                                className="pl-8 sm:w-[250px]"
                                defaultValue={query}
                            />
                            </div>
                        </form>
                        <LaporanClient availableYears={availableYears} selectedYear={year} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 {balances.length === 0 ? (
                    <div className="text-center h-24 text-muted-foreground flex items-center justify-center">
                        {query 
                            ? `Tidak ada anggota yang cocok dengan pencarian "${query}".`
                            : 'Tidak ada data anggota yang terdaftar untuk tahun ini.'
                        }
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Anggota</TableHead>
                                    <TableHead className="hidden sm:table-cell">ID PJLP</TableHead>
                                    <TableHead className="text-center">Total Hak Cuti</TableHead>
                                    <TableHead className="text-center">Cuti Terpakai</TableHead>
                                    <TableHead className="text-center font-semibold">Sisa Cuti</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {balances.map(balance => (
                                    <TableRow key={balance.id}>
                                        <TableCell className="font-medium">{balance.name || 'N/A'}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{balance.id_pjlp || 'N/A'}</TableCell>
                                        <TableCell className="text-center">{balance.total_days} hari</TableCell>
                                        <TableCell className="text-center">{balance.used_days} hari</TableCell>
                                        <TableCell className="text-center font-semibold text-primary">
                                            {balance.total_days - balance.used_days} hari
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    year?: string;
  };
}) {
    const query = searchParams?.query || "";
    const selectedYear = Number(searchParams?.year) || new Date().getFullYear();
    
    return (
        <Suspense fallback={<Loading />}>
            <ReportData year={selectedYear} query={query} />
        </Suspense>
    );
}
