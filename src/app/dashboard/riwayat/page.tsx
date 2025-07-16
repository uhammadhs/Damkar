
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type LeaveHistoryItem = {
  id: number;
  start_date: string;
  end_date: string;
  duration: number;
  title: string;
  reason: string | null;
  status: string;
  created_at: string;
  leave_types: { name: string } | null;
};

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

export default function RiwayatPage() {
  const supabase = createClient();
  const [allLeaveHistory, setAllLeaveHistory] = React.useState<LeaveHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);

  React.useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          duration,
          title,
          reason,
          status,
          created_at,
          leave_types (name)
        `)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        console.error("Error fetching leave history:", error);
      } else if (data) {
        setAllLeaveHistory(data as LeaveHistoryItem[]);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [supabase]);

  const availableYears = Array.from(new Set(allLeaveHistory.map(item => new Date(item.start_date).getFullYear()))).sort((a, b) => b - a);

  const filteredHistory = allLeaveHistory.filter(item => new Date(item.start_date).getFullYear() === selectedYear);
  
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
                 <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {(availableYears.length > 0 ? availableYears : [currentYear]).map(year => (
                             <SelectItem key={year} value={String(year)}>Tahun {year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <p className="py-10 text-center text-muted-foreground">Memuat riwayat...</p>
        ) : (
            <>
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
                            <thead>
                                <tr className="border-b">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Judul</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tanggal</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Durasi</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Alasan</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((req) => (
                                <tr key={req.id} className="border-b">
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
            </>
        )}
      </CardContent>
    </Card>
  );
}
