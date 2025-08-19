
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LaporanClient } from './laporan-client';
import type { Database } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const revalidate = 300; // Cache for 5 minutes

export type LeaveBalance = {
    year: number;
    total_days: number;
    used_days: number;
    profiles: {
        id: string;
        name: string | null;
        nip: string | null;
    } | null;
}

const getLeaveBalances = async (year: number): Promise<LeaveBalance[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('leave_balances')
        .select(`
            year,
            total_days,
            used_days,
            profiles!inner(
                id,
                name,
                nip
            )
        `)
        .eq('year', year)
        .eq('profiles.role', 'anggota')
        .order('name', { foreignTable: 'profiles', ascending: true });

    if (error) {
        console.error("Error fetching leave balances:", error);
        return [];
    }
    
    return data as LeaveBalance[];
}

const getAvailableYears = async (): Promise<number[]> => {
    const supabase = createClient();
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
    const availableYears = await getAvailableYears();
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(searchParams?.year) || (availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear);
    const balances = await getLeaveBalances(selectedYear);
    
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
                                <TableHead className="hidden sm:table-cell">NIP</TableHead>
                                <TableHead className="text-center">Total Hak Cuti</TableHead>
                                <TableHead className="text-center">Cuti Terpakai</TableHead>
                                <TableHead className="text-center font-semibold">Sisa Cuti</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {balances.length > 0 ? (
                                balances.map(balance => (
                                    <TableRow key={balance.profiles?.id}>
                                        <TableCell className="font-medium">{balance.profiles?.name || 'N/A'}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{balance.profiles?.nip || 'N/A'}</TableCell>
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
                                        Tidak ada data saldo cuti untuk tahun {selectedYear}.
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
