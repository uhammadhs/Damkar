import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";

const leaveHistory = [
  { id: 1, type: "Cuti Sakit", dates: "25-26 Des 2023", duration: 2, reason: "Surat dokter terlampir", status: "Menunggu" },
  { id: 2, type: "Cuti Tahunan", dates: "10-11 Nov 2023", duration: 2, reason: "Keperluan keluarga", status: "Disetujui" },
  { id: 3, type: "Izin", dates: "01 Nov 2023", duration: 1, reason: "Mengantar anak sekolah", status: "Ditolak" },
  { id: 4, type: "Cuti Tahunan", dates: "15-16 Okt 2023", duration: 2, reason: "Acara pernikahan saudara", status: "Disetujui" },
  { id: 5, type: "Cuti Sakit", dates: "05 Okt 2023", duration: 1, reason: "Demam dan flu", status: "Disetujui" },
  { id: 6, type: "Cuti Penting", dates: "20 Sep 2023", duration: 1, reason: "Menjenguk orang tua sakit", status: "Disetujui" },
  { id: 7, type: "Cuti Tahunan", dates: "01-03 Sep 2023", duration: 3, reason: "Liburan", status: "Disetujui" },
];

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


export default function RiwayatPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Riwayat Cuti</CardTitle>
        <CardDescription>
          Di sini Anda dapat melihat semua riwayat pengajuan cuti Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Daftar lengkap riwayat pengajuan cuti Anda.</TableCaption>
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
            {leaveHistory.map((req) => (
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
      </CardContent>
    </Card>
  );
}
