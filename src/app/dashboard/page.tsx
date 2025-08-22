
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeaveDonutChart } from "@/components/siap-cuti/leave-donut-chart";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Pengguna tidak ditemukan. Silakan login kembali.</div>;
  }

  let leaveBalance = null;
  let recentLeaveRequests = [];

  try {
      const currentYear = new Date().getFullYear();
      const { data: balanceData, error: balanceError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', currentYear)
        .single();
      
      if (balanceError && balanceError.code !== 'PGRST116') { // Ignore 'no rows' error
          throw balanceError;
      }
      leaveBalance = balanceData;

      const { data: requestsData, error: requestsError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (requestsError) {
          throw requestsError;
      }
      recentLeaveRequests = requestsData || [];

  } catch (error) {
      console.error("Dashboard data fetching error:", error);
      // We can still render the page with default values
  }


  const totalCuti = leaveBalance?.total_days || 12;
  const cutiTerpakai = leaveBalance?.used_days || 0;
  const sisaCuti = totalCuti - cutiTerpakai;

  return (
    <div className="relative space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          <Button asChild className="hidden md:inline-flex">
            <Link href="/dashboard/ajukan-cuti">
              <Plus />
              Ajukan Cuti
            </Link>
          </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Sisa Cuti Anda ({new Date().getFullYear()})</CardTitle>
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
            <CardTitle className="font-headline">Pengajuan Terkini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeaveRequests && recentLeaveRequests.length > 0 ? (
              recentLeaveRequests.map((req, index) => (
                <div key={req.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(req.start_date), "d MMM", { locale: id })} - {format(new Date(req.end_date), "d MMM yyyy", { locale: id })} ({req.duration} hari)
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                  </div>
                  {index < recentLeaveRequests.length - 1 && <Separator className="my-3" />}
                </div>
              ))
            ) : (
                <p className="text-sm text-muted-foreground">Belum ada pengajuan cuti.</p>
            )}
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
