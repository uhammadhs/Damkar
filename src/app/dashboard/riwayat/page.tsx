
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

// Define the type for a single leave history item
type LeaveHistoryItem = {
  id: number;
  dates: string;
  duration: number;
  title: string;
  reason: string;
  status: string;
  year: number;
};

// Mock data
const allLeaveHistory: LeaveHistoryItem[] = [
  // 2024
  { id: 8, dates: "05-06 Jan 2024", duration: 2, title: "Cuti Tahunan", reason: "Liburan awal tahun", status: "Disetujui", year: 2024 },
  
  // 2023
  { id: 1, dates: "25-26 Des 2023", duration: 2, title: "Izin Sakit", reason: "Surat dokter terlampir", status: "Menunggu", year: 2023 },
  { id: 2, dates: "10-11 Nov 2023", duration: 2, title: "Keperluan Keluarga", reason: "Keperluan keluarga", status: "Disetujui", year: 2023 },
  { id: 3, dates: "01 Nov 2023", duration: 1, title: "Anak Masuk Sekolah", reason: "Mengantar anak sekolah", status: "Ditolak", year: 2023 },
  { id: 4, dates: "15-16 Okt 2023", duration: 2, title: "Pernikahan Saudara", reason: "Acara pernikahan saudara", status: "Disetujui", year: 2023 },
  { id: 5, dates: "05 Okt 2023", duration: 1, title: "Sakit", reason: "Demam dan flu", status: "Disetujui", year: 2023 },
  { id: 6, dates: "20 Sep 2023", duration: 1, title: "Keluarga Sakit", reason: "Menjenguk orang tua sakit", status: "Disetujui", year: 2023 },
  { id: 7, dates: "01-03 Sep 2023", duration: 3, title: "Cuti Tahunan", reason: "Liburan", status: "Disetujui", year: 2023 },
];

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
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);

  const availableYears = Array.from(new Set(allLeaveHistory.map(item => item.year))).sort((a, b) => b - a);

  const filteredHistory = allLeaveHistory.filter(item => item.year === selectedYear);

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
                        {availableYears.map(year => (
                             <SelectItem key={year} value={String(year)}>Tahun {year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                                <p className="text-sm text-muted-foreground">{req.dates} ({req.duration} hari)</p>
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
                            <td className="p-4 align-middle">{req.dates}</td>
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
