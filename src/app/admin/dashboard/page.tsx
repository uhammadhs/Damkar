import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookCopy, BarChart } from "lucide-react";

const stats = [
    { title: "Total Anggota", value: "150", icon: Users, description: "Jumlah total anggota terdaftar." },
    { title: "Pengajuan Cuti (Bulan Ini)", value: "25", icon: BookCopy, description: "Total pengajuan cuti bulan ini." },
    { title: "Tingkat Kehadiran", value: "95%", icon: BarChart, description: "Rata-rata kehadiran bulan ini." },
]

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-headline">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Aktivitas Terkini</CardTitle>
                    <CardDescription>Pantau aktivitas terbaru dalam sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Konten aktivitas terkini akan ditampilkan di sini.</p>
                </CardContent>
            </Card>
        </div>
    )
}
