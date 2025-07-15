import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeaveDonutChart } from "@/components/siap-cuti/leave-donut-chart";

const recentLeaveRequests = [
  { id: 1, type: "Cuti Sakit", dates: "25-26 Des 2023", duration: 2, reason: "Surat dokter terlampir", status: "Menunggu" },
  { id: 2, type: "Cuti Tahunan", dates: "10-11 Nov 2023", duration: 2, reason: "Keperluan keluarga", status: "Disetujui" },
  { id: 3, type: "Izin", dates: "01 Nov 2023", duration: 1, reason: "Mengantar anak sekolah", status: "Ditolak" },
];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Menunggu':
      return 'secondary';
    case 'Disetujui':
      return 'default'; // Will be green due to custom theme later
    case 'Ditolak':
      return 'destructive';
    default:
      return 'outline';
  }
};

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

export default function DashboardPage() {
  const sisaCuti = 10;
  const totalCuti = 12;
  const cutiTerpakai = totalCuti - sisaCuti;

  return (
    <div className="relative space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Sisa Cuti Anda</CardTitle>
            <CardDescription>Visualisasi sisa cuti tahunan Anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-center">
              <LeaveDonutChart total={totalCuti} used={cutiTerpakai} />
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-card p-4">
                <span className="text-muted-foreground">Total Hak Cuti</span>
                <span className="font-bold font-headline">{totalCuti} Hari</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-card p-4">
                <span className="text-muted-foreground">Cuti Terpakai</span>
                <span className="font-bold font-headline">{cutiTerpakai} Hari</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4 text-primary">
                <span className="">Sisa Cuti</span>
                <span className="font-bold font-headline">{sisaCuti} Hari</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Status Pengajuan Terkini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeaveRequests.map((req, index) => (
              <div key={req.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{req.type}</p>
                    <p className="text-sm text-muted-foreground">{req.dates} ({req.duration} hari)</p>
                    <p className="text-xs text-muted-foreground italic">"{req.reason}"</p>
                  </div>
                  <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                </div>
                {index < recentLeaveRequests.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Button asChild className="fixed bottom-24 right-6 z-20 h-16 w-16 rounded-full shadow-lg md:hidden" size="icon">
        <Link href="/dashboard/ajukan-cuti">
          <Plus className="h-8 w-8" />
          <span className="sr-only">Ajukan Cuti Baru</span>
        </Link>
      </Button>
    </div>
  );
}
