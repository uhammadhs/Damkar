
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LaporanClient } from './laporan-client';
import type { Database } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export const revalidate = 300; // Cache for 5 minutes

export type LeaveBalanceReport = {
    id: string;
    name: string | null;
    id_pjlp: string | null;
    total_days: number;
    used_days: number;
}

const getLeaveBalances = async (year: number, cookieStore: ReadonlyRequestCookies): Promise<LeaveBalanceReport[]> => {
    const supabase = createClient(cookieStore);
    // Fetch all members (profiles with 'anggota' role)
    // and LEFT JOIN their leave balance for the selected year.
    // This ensures all members are listed, even if they have no balance entry for that year.
    const { data, error } = await supabase
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
        .eq('leave_balances.year', year)
        .order('name', { ascending: true });

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
    return years.length > 0 ? years : [new Date().getFullYear()];
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams?: {
    year?: string;
  };
}) {
    const cookieStore = cookies();
    const availableYears = await getAvailableYears(cookieStore);
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(searchParams?.year) || (availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear);
    const balances = await getLeaveBalances(selectedYear, cookieStore);
    
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
                    <LaporanClient availableYears={availableYears} selectedYear={selectedYear} />
                </div>
            </CardHeader>
            <CardContent>
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
                            {balances.length > 0 ? (
                                balances.map(balance => (
                                    <TableRow key={balance.id}>
                                        <TableCell className="font-medium">{balance.name || 'N/A'}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{balance.id_pjlp || 'N/A'}</TableCell>
                                        <TableCell className="text-center">{balance.total_days} hari</TableCell>
                                        <TableCell className="text-center">{balance.used_days} hari</TableCell>
                                        <TableCell className="text-center font-semibold text-primary">
                                            {balance.total_days - balance.used_days} hari
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        Tidak ada data anggota yang terdaftar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
