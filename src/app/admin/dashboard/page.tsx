
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookCopy, BarChart, CheckCircle, ArrowRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type RecentRequest = {
    id: number;
    title: string;
    created_at: string;
    profiles: {
        name: string | null;
        avatar_url: string | null;
    } | null;
};

export default async function AdminDashboardPage() {
    const supabase = createClient();
    let totalMembers = 0;
    let monthlyRequests = 0;
    let approvedRequests = 0;
    let recentRequests: RecentRequest[] = [];
    
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

        const { data: recentRequestsData, error: recentRequestsError } = await supabase
            .from('leave_requests')
            .select(`
                id,
                title,
                created_at,
                profiles (name, avatar_url)
            `)
            .eq('status', 'Menunggu')
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentRequestsError) throw recentRequestsError;
        recentRequests = recentRequestsData as RecentRequest[];

    } catch(error) {
        console.error("Error fetching admin dashboard stats:", error);
    }
    
    const stats = [
        { title: "Total Anggota", value: totalMembers, icon: Users },
        { title: "Pengajuan Cuti (Bulan Ini)", value: monthlyRequests, icon: BookCopy },
        { title: "Pengajuan Disetujui", value: approvedRequests, icon: CheckCircle },
    ];

    const getAvatarFallback = (name: string | null) => {
        if (!name) return "??";
        const parts = name.split(" ");
        if (parts.length > 1) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

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
                    {recentRequests.length > 0 ? (
                        <div className="space-y-4">
                            {recentRequests.map((request) => (
                                <div key={request.id} className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={request.profiles?.avatar_url || undefined} data-ai-hint="male portrait" />
                                        <AvatarFallback>{getAvatarFallback(request.profiles?.name || null)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            <span className="font-semibold">{request.profiles?.name || 'Anggota'}</span> mengajukan <span className="font-semibold">"{request.title}"</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: id })}
                                        </p>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/admin/manajemen-cuti">
                                            Lihat
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-6">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-4">Semua pengajuan sudah diproses.</p>
                            <p className="text-sm">Tidak ada aktivitas yang menunggu persetujuan saat ini.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
