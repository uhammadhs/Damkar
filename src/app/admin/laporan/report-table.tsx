
"use server"

import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type LeaveBalanceReport = {
    id: string;
    name: string | null;
    id_pjlp: string | null;
    total_days: number;
    used_days: number;
}

const getLeaveBalances = async (year: number, query: string): Promise<LeaveBalanceReport[]> => {
    const supabase = createClient();
    
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

export async function ReportTable({ year, query }: { year: number, query: string }) {
    const balances = await getLeaveBalances(year, query);
    
    if (balances.length === 0) {
        return (
            <div className="text-center h-24 text-muted-foreground flex items-center justify-center">
                {query 
                    ? `Tidak ada anggota yang cocok dengan pencarian "${query}".`
                    : 'Tidak ada data anggota untuk tahun yang dipilih.'
                }
            </div>
        )
    }
    
    return (
        <>
            {/* Mobile View: List of Cards */}
            <div className="space-y-4 md:hidden">
                {balances.map(balance => {
                    const remainingDays = balance.total_days - balance.used_days;
                    return (
                        <Card key={balance.id}>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <p className="font-semibold">{balance.name || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground">ID: {balance.id_pjlp || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Sisa Cuti</p>
                                        <p className="text-lg font-bold text-primary">{remainingDays} hari</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="mt-2 pt-2 border-t text-sm text-muted-foreground grid grid-cols-2 gap-x-4">
                                   <p>Total Hak: <span className="font-medium text-foreground">{balance.total_days} hari</span></p>
                                   <p>Terpakai: <span className="font-medium text-foreground">{balance.used_days} hari</span></p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block">
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
            </div>
        </>
    )
}
