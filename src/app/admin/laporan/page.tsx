
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const revalidate = 300; // Cache for 5 minutes

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

async function ReportTable({ year, query }: { year: number, query: string }) {
    const balances = await getLeaveBalances(year, query);
    
    return (
        <>
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
        </>
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
    
    // The page now ONLY renders the data table. The surrounding Card and filters
    // are handled by the new layout.tsx file.
    // Next.js will automatically use `loading.tsx` as the suspense boundary for this component.
    return <ReportTable year={selectedYear} query={query} />;
}
