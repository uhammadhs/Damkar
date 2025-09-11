
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookCopy, CheckCircle, ArrowRight } from "lucide-react";
import { format, formatDistanceToNow, startOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as React from 'react';
import { LeaveStatsChartWrapper } from "./leave-stats-chart-wrapper";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import Loading from "./loading";

export const revalidate = 60; // Cache for 60 seconds

type RecentRequest = {
    id: number;
    title: string;
    created_at: string;
    status: string;
    profiles: {
        name: string | null;
        avatar_url: string | null;
    } | null;
};

export type MonthlyRequestStat = {
    month: string;
    Disetujui: number;
    Ditolak: number;
    Menunggu: number;
}

async function getStatsData() {
    const supabase = createClient();
    const today = new Date();
    const firstDayOfMonth = format(startOfMonth(today), 'yyyy-MM-dd');

    const membersCountPromise = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'anggota');

    const monthlyCountPromise = supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth);

    const approvedCountPromise = supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth)
        .eq('status', 'Disetujui');

    const [
        { count: membersCount, error: membersError },
        { count: monthlyCount, error: requestsError },
        { count: approvedCount, error: approvedError },
    ] = await Promise.all([membersCountPromise, monthlyCountPromise, approvedCountPromise]);

    if (membersError) console.error("Error fetching members count:", membersError.message);
    if (requestsError) console.error("Error fetching monthly requests count:", requestsError.message);
    if (approvedError) console.error("Error fetching approved requests count:", approvedError.message);

    return {
        totalMembers: membersCount || 0,
        monthlyRequests: monthlyCount || 0,
        approvedRequests: approvedCount || 0,
    };
}

async function getRecentRequests() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('leave_requests')
        .select('id, title, created_at, status, profiles (name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching recent requests:", error.message);
        return [];
    }
    return (data as RecentRequest[]) || [];
}

async function getChartData() {
    const supabase = createClient();
    const today = new Date();
    const sixMonthsAgo = format(startOfMonth(subMonths(today, 5)), 'yyyy-MM-dd');

    const { data: rawChartData, error: chartError } = await supabase
        .from('leave_requests')
        .select('created_at, status')
        .gte('created_at', sixMonthsAgo);

    if (chartError) {
        console.error("Error fetching raw chart data:", chartError.message);
        return [];
    }

    const monthlyStats: { [key: string]: MonthlyRequestStat } = {};
    const monthLabels = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(today, i);
        return format(d, 'MMMM yyyy', { locale: id });
    }).reverse();

    monthLabels.forEach(label => {
        monthlyStats[label] = { month: label.split(' ')[0], Disetujui: 0, Ditolak: 0, Menunggu: 0 };
    });

    if(rawChartData) {
        rawChartData.forEach(req => {
            const monthKey = format(new Date(req.created_at), 'MMMM yyyy', { locale: id });
            if (monthlyStats[monthKey] && req.status) {
                 if (req.status === 'Disetujui' || req.status === 'Ditolak' || req.status === 'Menunggu') {
                    monthlyStats[monthKey][req.status]++;
                 }
            }
        });
    }

    return Object.values(monthlyStats);
}

const getAvatarFallback = (name: string | null) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Menunggu': return 'bg-accent text-accent-foreground';
        case 'Disetujui': return 'bg-green-600 text-white';
        case 'Ditolak': return 'bg-destructive text-destructive-foreground';
        default: return 'bg-muted-foreground text-muted';
    }
};

async function StatCards() {
    const { totalMembers, monthlyRequests, approvedRequests } = await getStatsData();
    const stats = [
        { title: "Total Anggota", value: totalMembers, icon: Users },
        { title: "Pengajuan Bulan Ini", value: monthlyRequests, icon: BookCopy },
        { title: "Disetujui Bulan Ini", value: approvedRequests, icon: CheckCircle },
    ];
    return (
        <>
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
        </>
    )
}

async function RecentActivity() {
    const recentRequests = await getRecentRequests();
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Aktivitas Terkini</CardTitle>
                        <CardDescription className="text-xs">5 pengajuan terakhir.</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/manajemen-cuti">
                            Lihat Semua
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
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
                                    <p className="text-sm font-medium leading-snug">
                                        <span className="font-semibold">{request.profiles?.name || 'Anggota'}</span> mengajukan <span className="font-semibold text-primary">"{request.title}"</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: id })}
                                    </p>
                                </div>
                                <Badge variant="outline" className={getStatusColor(request.status)}>{request.status}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-6">
                        <BookCopy className="mx-auto h-12 w-12" />
                        <p className="mt-4">Belum Ada Pengajuan</p>
                        <p className="text-sm">Saat ini tidak ada pengajuan cuti yang tercatat.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

async function Chart() {
    const chartData = await getChartData();
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="font-headline">Statistik Pengajuan Cuti</CardTitle>
                <CardDescription>6 Bulan Terakhir</CardDescription>
            </CardHeader>
            <CardContent>
                <LeaveStatsChartWrapper data={chartData} />
            </CardContent>
        </Card>
    )
}


export default async function AdminDashboardPage() {
    return (
        <Suspense fallback={<Loading/>}>
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Suspense fallback={
                        <>
                            <Card className="h-24" />
                            <Card className="h-24" />
                            <Card className="h-24" />
                        </>
                    }>
                        <StatCards />
                    </Suspense>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <Suspense fallback={
                        <>
                            <Card className="h-[350px] w-full lg:col-span-3" />
                            <Card className="h-[350px] w-full lg:col-span-2" />
                        </>
                    }>
                       <Chart />
                       <RecentActivity />
                    </Suspense>
                </div>
            </div>
        </Suspense>
    )
}
