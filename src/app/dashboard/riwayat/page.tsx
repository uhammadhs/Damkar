
import * as React from "react"
import { createClient } from "@/lib/supabase/server";
import { RiwayatClient } from "./riwayat-client";
import type { Database } from "@/types/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const revalidate = 60; // Cache for 60 seconds

export type LeaveHistoryItem = Pick<
  Database['public']['Tables']['leave_requests']['Row'],
  'id' | 'start_date' | 'end_date' | 'duration' | 'title' | 'reason' | 'status' | 'created_at'
>;

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Menunggu':
            return 'bg-accent text-accent-foreground';
        case 'Disetujui':
            return 'bg-green-600 text-white';
        case 'Ditolak':
            return 'bg-destructive text-destructive-foreground';
        default:
            return 'bg-gray-500 text-white';
    }
}


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
    
    const availableYears = Array.from(new Set(allHistory.map(item => new Date(item.start_date).getFullYear()))).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(searchParams?.year) || (availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear);


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
                {/* Mobile View: List of Cards */}
                <div className="space-y-4 md:hidden">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((req) => (
                            <Card key={req.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium">{req.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {format(new Date(req.start_date), 'd MMM', { locale: id })} - {format(new Date(req.end_date), 'd MMM yyyy', { locale: id })} ({req.duration} hari)
                                        </p>
                                        <p className="text-xs text-muted-foreground italic">"{req.reason}"</p>
                                    </div>
                                    <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="py-10 text-center text-muted-foreground">Tidak ada riwayat cuti untuk tahun {selectedYear}.</p>
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block">
                {filteredHistory.length > 0 ? (
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
                                    <td className="p-4 align-middle font-medium">{req.title}</td>
                                    <td className="p-4 align-middle">{format(new Date(req.start_date), 'd MMM', { locale: id })} - {format(new Date(req.end_date), 'd MMM yyyy', { locale: id })}</td>
                                    <td className="p-4 align-middle text-center">{req.duration} hari</td>
                                    <td className="p-4 align-middle">{req.reason}</td>
                                    <td className="p-4 align-middle text-right">
                                    <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                ) : (
                        <p className="py-10 text-center text-muted-foreground">Tidak ada riwayat cuti untuk tahun {selectedYear}.</p>
                )}
                </div>
          </CardContent>
        </Card>
      );
}
