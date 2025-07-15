import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, PieChart, Calendar as CalendarIcon, Users } from "lucide-react";

export default function LaporanPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Laporan Cuti dan Kehadiran</CardTitle>
                    <CardDescription>Analisis data cuti dan kehadiran anggota.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Cuti Disetujui</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-headline">78 Hari</div>
                                <p className="text-xs text-muted-foreground">dalam 3 bulan terakhir</p>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Anggota Paling Sering Cuti</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-headline">Anggota Damkar 2</div>
                                <p className="text-xs text-muted-foreground">Total 12 hari cuti</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tingkat Kehadiran Rata-rata</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-headline">95%</div>
                                <p className="text-xs text-muted-foreground">Bulan ini</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Tren Pengajuan Cuti</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-center h-64 bg-secondary rounded-md">
                            <BarChart className="h-16 w-16 text-muted-foreground" />
                         </div>
                         <p className="text-center text-sm text-muted-foreground mt-2">Grafik tren pengajuan cuti akan ditampilkan di sini.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Distribusi Jenis Cuti</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-center h-64 bg-secondary rounded-md">
                            <PieChart className="h-16 w-16 text-muted-foreground" />
                         </div>
                         <p className="text-center text-sm text-muted-foreground mt-2">Grafik distribusi jenis cuti akan ditampilkan di sini.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
