
import * as React from "react"
import { createClient } from "@/lib/supabase/server";
import { RiwayatClient } from "./riwayat-client";
import type { Database } from "@/types/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarX2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Cache for 60 seconds

export type LeaveHistoryItem = Pick<
  Database['public']['Tables']['leave_requests']['Row'],
  'id' | 'start_date' | 'end_date' | 'duration' | 'title' | 'reason' | 'status' | 'created_at'
>;

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Menunggu':
            return 'bg-accent text-accent-foreground hover:bg-accent/80';
        case 'Disetujui':
            return 'bg-green-600 text-white hover:bg-green-600/80';
        case 'Ditolak':
            return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
        default:
            return 'bg-gray-500 text-white hover:bg-gray-500/80';
    }
}

const EmptyState = ({ year }: { year: number }) => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <CalendarX2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold font-headline">Belum Ada Riwayat</h2>
        <p className="mt-2 text-sm text-muted-foreground">
            Anda tidak memiliki riwayat pengajuan cuti untuk tahun {year}.
        </p>
        <Button asChild className="mt-6">
            <Link href="/dashboard/ajukan-cuti">Ajukan Cuti Sekarang</Link>
        </Button>
    </div>
);


export default async function RiwayatPage({
  searchParams
}: {
  searchParams?: {
    year?: string;
  }
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Pengguna tidak ditemukan</div>;
    }

    const allHistoryQuery = supabase
        .from('leave_requests')
        .select('id, start_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

    const { data: allHistory, error: allHistoryError } = await allHistoryQuery;
    if (allHistoryError) {
        console.error("Error fetching all leave history:", allHistoryError);
        return <div>Gagal memuat data.</div>;
    }
    
    const currentYear = new Date().getFullYear();
    const yearsFromHistory = allHistory.map(item => new Date(item.start_date).getFullYear());
    // Gabungkan tahun dari riwayat dengan tahun sekarang, hapus duplikat, dan urutkan.
    const availableYears = Array.from(new Set([...yearsFromHistory, currentYear])).sort((a, b) => b - a);

    const selectedYear = Number(searchParams?.year) || currentYear;


    const { data: filteredHistory, error } = await supabase
        .from('leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          duration,
          title,
          reason,
          status,
          created_at
        `)
        .eq('user_id', user.id)
        .gte('start_date', `${selectedYear}-01-01`)
        .lte('start_date', `${selectedYear}-12-31`)
        .order('start_date', { ascending: false });

    if (error) {
        console.error("Error fetching leave history:", error);
        return <div>Gagal memuat riwayat cuti.</div>;
    }
    
    return (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="font-headline">Riwayat Cuti</CardTitle>
                    <CardDescription>
                    Lihat semua riwayat pengajuan cuti Anda berdasarkan tahun.
                    </CardDescription>
                </div>
                <div className="w-full sm:w-auto">
                    <RiwayatClient availableYears={availableYears} selectedYear={selectedYear} />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
                <EmptyState year={selectedYear} />
            ) : (
                <>
                    {/* Mobile View: List of Cards */}
                    <div className="space-y-4 md:hidden">
                        {filteredHistory.map((req) => (
                            <Card key={req.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium">{req.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(req.start_date), 'd MMM', { locale: id })} - {format(new Date(req.end_date), 'd MMM yyyy', { locale: id })} ({req.duration} hari)
                                        </p>
                                    </div>
                                    <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                                </div>
                                {req.reason && (
                                    <p className="text-sm text-muted-foreground italic mt-2 pt-2 border-t">"{req.reason}"</p>
                                )}
                            </Card>
                        ))}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Judul</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tanggal</th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Durasi</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Alasan</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredHistory.map((req) => (
                                    <tr key={req.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium max-w-xs truncate">{req.title}</td>
                                        <td className="p-4 align-middle whitespace-nowrap">{format(new Date(req.start_date), 'd MMM', { locale: id })} - {format(new Date(req.end_date), 'd MMM yyyy', { locale: id })}</td>
                                        <td className="p-4 align-middle text-center">{req.duration} hari</td>
                                        <td className="p-4 align-middle max-w-sm truncate">{req.reason}</td>
                                        <td className="p-4 align-middle text-right">
                                        <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
          </CardContent>
        </Card>
      );
}
