import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeaveHistoryList } from "@/components/siap-cuti/leave-history-list";

const leaveHistory = [
  { id: 1, type: "Cuti Sakit", dates: "25-26 Des 2023", duration: 2, reason: "Surat dokter terlampir", status: "Menunggu" },
  { id: 2, type: "Cuti Tahunan", dates: "10-11 Nov 2023", duration: 2, reason: "Keperluan keluarga", status: "Disetujui" },
  { id: 3, type: "Izin", dates: "01 Nov 2023", duration: 1, reason: "Mengantar anak sekolah", status: "Ditolak" },
  { id: 4, type: "Cuti Tahunan", dates: "15-16 Okt 2023", duration: 2, reason: "Acara pernikahan saudara", status: "Disetujui" },
  { id: 5, type: "Cuti Sakit", dates: "05 Okt 2023", duration: 1, reason: "Demam dan flu", status: "Disetujui" },
  { id: 6, type: "Cuti Penting", dates: "20 Sep 2023", duration: 1, reason: "Menjenguk orang tua sakit", status: "Disetujui" },
  { id: 7, type: "Cuti Tahunan", dates: "01-03 Sep 2023", duration: 3, reason: "Liburan", status: "Disetujui" },
];


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
        <LeaveHistoryList leaveHistory={leaveHistory} />
      </CardContent>
    </Card>
  );
}
