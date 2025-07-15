"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Define the type for a single leave history item
type LeaveHistoryItem = {
  id: number;
  type: string;
  dates: string;
  duration: number;
  reason: string;
  status: string;
};

// Define the props for the component
interface LeaveHistoryListProps {
  leaveHistory: LeaveHistoryItem[];
}

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Menunggu':
            return 'bg-accent text-accent-foreground';
        case 'Disetujui':
            return 'bg-green-600 text-white'; // Success color
        case 'Ditolak':
            return 'bg-destructive text-destructive-foreground';
        default:
            return 'bg-gray-500 text-white';
    }
}

export function LeaveHistoryList({ leaveHistory }: LeaveHistoryListProps) {
  const [showAll, setShowAll] = React.useState(false);
  const displayedHistory = showAll ? leaveHistory : leaveHistory.slice(0, 5);

  return (
    <>
      {/* Mobile View: List of Cards */}
      <div className="space-y-4 md:hidden">
        {displayedHistory.map((req, index) => (
          <div key={req.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <p className="font-medium">{req.type}</p>
                <p className="text-sm text-muted-foreground">{req.dates}</p>
                <p className="text-sm text-muted-foreground">{req.duration} hari</p>
                <p className="text-xs text-muted-foreground italic">"{req.reason}"</p>
              </div>
              <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
            </div>
            {index < displayedHistory.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
          <Table>
              <TableCaption>
                {leaveHistory.length > 5 && (showAll 
                  ? "Daftar lengkap riwayat pengajuan cuti Anda."
                  : `Menampilkan 5 dari ${leaveHistory.length} riwayat.`)}
              </TableCaption>
              <TableHeader>
                  <TableRow>
                  <TableHead>Jenis Cuti</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Durasi</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {displayedHistory.map((req) => (
                  <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.type}</TableCell>
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
      
      {!showAll && leaveHistory.length > 5 && (
          <div className="mt-6 flex justify-center">
              <Button onClick={() => setShowAll(true)} variant="outline">
                  Lihat Semua Riwayat
              </Button>
          </div>
      )}
    </>
  );
}
