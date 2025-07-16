
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookCopy, BarChart, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
    const supabase = createClient();
    
    // Fetch total members
    const { count: totalMembers, error: membersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'anggota');

    // Fetch leave requests this month
    const today = new Date();
    const firstDayOfMonth = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
    const { count: monthlyRequests, error: requestsError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth);

    // Fetch approved leave requests this month
    const { count: approvedRequests, error: approvedError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth)
        .eq('status', 'Disetujui');

    if (membersError) console.error("Error fetching members count:", membersError);
    if (requestsError) console.error("Error fetching requests count:", requestsError);
    if (approvedError) console.error("Error fetching approved requests count:", approvedError);

    // Calculate presence rate (this is a simplified example)
    const presenceRate = monthlyRequests && approvedRequests != null ? 
        (((monthlyRequests - approvedRequests) / monthlyRequests) * 100).toFixed(0) + '%' : 'N/A';
    
    const stats = [
        { title: "Total Anggota", value: totalMembers ?? 0, icon: Users },
        { title: "Pengajuan Cuti (Bulan Ini)", value: monthlyRequests ?? 0, icon: BookCopy },
        { title: "Pengajuan Disetujui", value: approvedRequests ?? 0, icon: CheckCircle },
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
