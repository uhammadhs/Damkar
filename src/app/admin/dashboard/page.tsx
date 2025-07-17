
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookCopy, BarChart, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
    const supabase = createClient();
    let totalMembers = 0;
    let monthlyRequests = 0;
    let approvedRequests = 0;
    
    try {
        const { count: membersCount, error: membersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'anggota');
        if (membersError) throw membersError;
        totalMembers = membersCount || 0;

        const today = new Date();
        const firstDayOfMonth = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
        
        const { count: monthlyCount, error: requestsError } = await supabase
            .from('leave_requests')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', firstDayOfMonth);
        if (requestsError) throw requestsError;
        monthlyRequests = monthlyCount || 0;
        
        const { count: approvedCount, error: approvedError } = await supabase
            .from('leave_requests')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', firstDayOfMonth)
            .eq('status', 'Disetujui');
        if (approvedError) throw approvedError;
        approvedRequests = approvedCount || 0;

    } catch(error) {
        console.error("Error fetching admin dashboard stats:", error);
    }
    
    const stats = [
        { title: "Total Anggota", value: totalMembers, icon: Users },
        { title: "Pengajuan Cuti (Bulan Ini)", value: monthlyRequests, icon: BookCopy },
        { title: "Pengajuan Disetujui", value: approvedRequests, icon: CheckCircle },
    ];

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
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Aktivitas Terkini</CardTitle>
                    <CardDescription>Menampilkan pengajuan cuti terbaru yang menunggu persetujuan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Konten aktivitas terkini akan ditampilkan di sini, seperti daftar pengajuan yang menunggu persetujuan.</p>
                </CardContent>
            </Card>
        </div>
    )
}
