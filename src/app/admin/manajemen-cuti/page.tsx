import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const leaveRequests = [
  { id: 1, name: "Anggota Damkar 1", type: "Cuti Sakit", dates: "25-26 Des 2023", duration: 2, reason: "Surat dokter terlampir", status: "Menunggu" },
  { id: 2, name: "Anggota Damkar 2", type: "Cuti Tahunan", dates: "10-11 Nov 2023", duration: 2, reason: "Keperluan keluarga", status: "Disetujui" },
  { id: 3, name: "Anggota Damkar 3", type: "Izin", dates: "01 Nov 2023", duration: 1, reason: "Mengantar anak sekolah", status: "Ditolak" },
  { id: 4, name: "Anggota Damkar 4", type: "Cuti Tahunan", dates: "28-29 Des 2023", duration: 2, reason: "Liburan akhir tahun", status: "Menunggu" },
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

export default function ManajemenCutiPage() {
  const waitingRequests = leaveRequests.filter(req => req.status === "Menunggu");

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Manajemen Pengajuan Cuti</CardTitle>
            <CardDescription>Tinjau dan proses pengajuan cuti dari anggota.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="menunggu">
                <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
                    <TabsTrigger value="menunggu">Menunggu Persetujuan ({waitingRequests.length})</TabsTrigger>
                    <TabsTrigger value="semua">Semua Pengajuan ({leaveRequests.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="menunggu">
                     <LeaveRequestTable requests={waitingRequests} />
                </TabsContent>
                 <TabsContent value="semua">
                    <LeaveRequestTable requests={leaveRequests} />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}

function LeaveRequestTable({ requests }: { requests: typeof leaveRequests }) {
    if (requests.length === 0) {
        return <p className="py-10 text-center text-muted-foreground">Tidak ada pengajuan cuti.</p>
    }

    return (
        <div className="mt-4">
            {/* Mobile View: List of Cards */}
            <div className="space-y-4 md:hidden">
                {requests.map((req) => (
                    <Card key={req.id} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                           <div className="flex-1 space-y-2">
                                <p className="font-semibold">{req.name}</p>
                                <p className="text-sm">
                                    {req.type} - {req.dates} ({req.duration} hari)
                                </p>
                                <p className="text-sm text-muted-foreground italic">"{req.reason}"</p>
                           </div>
                           <Badge className={`${getStatusColor(req.status)} shrink-0`}>{req.status}</Badge>
                        </div>
                        {req.status === 'Menunggu' && (
                             <div className="mt-4 flex justify-end gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700">
                                    <Check className="h-4 w-4" />
                                    <span className="ml-1">Setujui</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-destructive border-destructive hover:bg-destructive/10">
                                    <X className="h-4 w-4" />
                                    <span className="ml-1">Tolak</span>
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden overflow-x-auto md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Nama Anggota</TableHead>
                        <TableHead>Jenis & Tanggal</TableHead>
                        <TableHead>Alasan</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.name}</TableCell>
                            <TableCell>
                                <div>{req.type}</div>
                                <div className="text-xs text-muted-foreground">{req.dates} ({req.duration} hari)</div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                            <TableCell className="text-center">
                                <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            {req.status === 'Menunggu' && (
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700">
                                        <Check className="h-4 w-4" />
                                        <span className="sr-only">Setujui</span>
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive border-destructive hover:bg-destructive/10">
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Tolak</span>
                                    </Button>
                                </div>
                            )}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
