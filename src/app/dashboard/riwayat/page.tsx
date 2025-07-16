
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Define the type for a single leave history item
type LeaveHistoryItem = {
  id: number;
  dates: string;
  duration: number;
  title: string;
  reason: string;
  status: string;
};

// Mock data
const allLeaveHistory: LeaveHistoryItem[] = [
  { id: 1, dates: "25-26 Des 2023", duration: 2, title: "Izin Sakit", reason: "Surat dokter terlampir", status: "Menunggu" },
  { id: 2, dates: "10-11 Nov 2023", duration: 2, title: "Keperluan Keluarga", reason: "Keperluan keluarga", status: "Disetujui" },
  { id: 3, dates: "01 Nov 2023", duration: 1, title: "Anak Masuk Sekolah", reason: "Mengantar anak sekolah", status: "Ditolak" },
  { id: 4, dates: "15-16 Okt 2023", duration: 2, title: "Pernikahan Saudara", reason: "Acara pernikahan saudara", status: "Disetujui" },
  { id: 5, dates: "05 Okt 2023", duration: 1, title: "Sakit", reason: "Demam dan flu", status: "Disetujui" },
  { id: 6, dates: "20 Sep 2023", duration: 1, title: "Keluarga Sakit", reason: "Menjenguk orang tua sakit", status: "Disetujui" },
  { id: 7, dates: "01-03 Sep 2023", duration: 3, title: "Cuti Tahunan", reason: "Liburan", status: "Disetujui" },
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
  const [showAll, setShowAll] = React.useState(false);
  const displayedHistory = showAll ? allLeaveHistory : allLeaveHistory.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Riwayat Cuti</CardTitle>
        <CardDescription>
          Di sini Anda dapat melihat semua riwayat pengajuan cuti Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
         {/* Mobile View: List of Cards */}
        <div className="space-y-4 md:hidden">
            {displayedHistory.map((req) => (
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
            ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
            <Table>
                <TableCaption>
                    {allLeaveHistory.length > 5 && !showAll 
                    ? `Menampilkan 5 dari ${allLeaveHistory.length} riwayat.`
                    : "Daftar lengkap riwayat pengajuan cuti Anda."}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-center">Durasi</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayedHistory.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.title}</TableCell>
                        <TableCell>{req.dates}</TableCell>
                        <TableCell className="text-center">{req.duration} hari</TableCell>
                        <TableCell>{req.reason}</TableCell>
                        <TableCell className="text-right">
                        <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        
        {!showAll && allLeaveHistory.length > 5 && (
            <div className="mt-6 flex justify-center">
                <Button onClick={() => setShowAll(true)} variant="outline">
                    Lihat Semua Riwayat
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
