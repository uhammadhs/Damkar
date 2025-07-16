
"use client"

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { updateLeaveRequestStatus } from "./actions";

type LeaveRequest = {
  id: number;
  created_at: string;
  duration: number;
  end_date: string;
  reason: string | null;
  start_date: string;
  status: string;
  title: string;
  attachment_url: string | null;
  profiles: {
    name: string | null;
    nip: string | null;
  } | null;
};

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
  const supabase = createClient();
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles (name, nip)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching leave requests:", error);
      toast({ title: "Gagal", description: "Tidak dapat memuat data pengajuan.", variant: "destructive" });
    } else {
      setLeaveRequests(data as LeaveRequest[]);
    }
    setLoading(false);
  }, [supabase, toast]);

  React.useEffect(() => {
    fetchRequests();
    
    const channel = supabase
      .channel('leave_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leave_requests' },
        (payload) => {
          console.log('Change received!', payload)
          fetchRequests(); // Re-fetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [supabase, fetchRequests]);

  const handleUpdateRequest = async (id: number, status: "Disetujui" | "Ditolak") => {
    const originalRequests = [...leaveRequests];
    // Optimistic update
    setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));

    const result = await updateLeaveRequestStatus(id, status);
    
    if (result.success) {
      toast({
          title: "Sukses",
          description: result.message,
      });
    } else {
      // Revert on failure
      setLeaveRequests(originalRequests);
      toast({
        title: "Gagal",
        description: result.message,
        variant: "destructive",
      });
    }
    // No need to call fetchRequests() here because the subscription will handle it.
  };

  const waitingRequests = leaveRequests.filter(req => req.status === "Menunggu");
  const allRequests = leaveRequests;

  if (loading) {
    return (
        <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Memuat data pengajuan cuti...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardContent className="pt-6">
            <Tabs defaultValue="menunggu">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="menunggu">Menunggu ({waitingRequests.length})</TabsTrigger>
                    <TabsTrigger value="semua">Semua ({allRequests.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="menunggu">
                     <LeaveRequestTable requests={waitingRequests} onUpdateRequest={handleUpdateRequest} />
                </TabsContent>
                 <TabsContent value="semua">
                    <LeaveRequestTable requests={allRequests} onUpdateRequest={handleUpdateRequest} />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}

function LeaveRequestTable({ requests, onUpdateRequest }: { requests: LeaveRequest[], onUpdateRequest: (id: number, status: "Disetujui" | "Ditolak") => void }) {
    if (requests.length === 0) {
        return <p className="py-10 text-center text-muted-foreground">Tidak ada pengajuan cuti.</p>
    }
    
    const formatDateRange = (start: string, end: string) => {
        return `${format(new Date(start), 'd MMM', { locale: id })} - ${format(new Date(end), 'd MMM yyyy', { locale: id })}`;
    }

    return (
        <div className="mt-4">
            {/* Mobile View: List of Cards */}
            <div className="space-y-4 md:hidden">
                {requests.map((req) => (
                    <Card key={req.id}>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-base font-semibold leading-tight">{req.title}</p>
                                    <p className="text-sm text-muted-foreground">{req.profiles?.name || 'Nama Tidak Ditemukan'}</p>
                                </div>
                                <Badge className={`${getStatusColor(req.status)} shrink-0`}>{req.status}</Badge>
                            </div>
                            <p className="text-sm pt-2 text-muted-foreground">
                                {formatDateRange(req.start_date, req.end_date)} ({req.duration} hari)
                            </p>
                        </CardHeader>
                        <CardFooter className="flex p-4 pt-0 gap-2">
                             <LeaveRequestDialog request={req} onUpdateRequest={onUpdateRequest}>
                                <Button variant="outline" className="w-full">Lihat Detail</Button>
                            </LeaveRequestDialog>
                            {req.status === 'Menunggu' && (
                                <>
                                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 text-destructive border-destructive hover:bg-destructive/10" onClick={() => onUpdateRequest(req.id, "Ditolak")}>
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Tolak</span>
                                </Button>
                                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => onUpdateRequest(req.id, "Disetujui")}>
                                    <Check className="h-4 w-4" />
                                    <span className="sr-only">Setujui</span>
                                </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden overflow-x-auto md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Nama Anggota</TableHead>
                        <TableHead>Judul Pengajuan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.profiles?.name || 'Nama Tidak Ditemukan'}</TableCell>
                                <TableCell className="max-w-xs truncate">{req.title}</TableCell>
                                <TableCell>
                                    <div>{formatDateRange(req.start_date, req.end_date)}</div>
                                    <div className="text-xs text-muted-foreground">{req.duration} hari</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge className={`${getStatusColor(req.status)}`}>{req.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <LeaveRequestDialog request={req} onUpdateRequest={onUpdateRequest}>
                                            <Button variant="outline" size="sm">Lihat Detail</Button>
                                        </LeaveRequestDialog>
                                        {req.status === 'Menunggu' && (
                                            <>
                                                <Button variant="outline" size="icon" className="h-9 w-9 text-destructive border-destructive hover:bg-destructive/10" onClick={() => onUpdateRequest(req.id, "Ditolak")}>
                                                    <X className="h-4 w-4" />
                                                    <span className="sr-only">Tolak</span>
                                                </Button>
                                                <Button variant="outline" size="icon" className="h-9 w-9 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => onUpdateRequest(req.id, "Disetujui")}>
                                                    <Check className="h-4 w-4" />
                                                    <span className="sr-only">Setujui</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function LeaveRequestDialog({ request, children, onUpdateRequest }: { request: LeaveRequest, children: React.ReactNode, onUpdateRequest: (id: number, status: "Disetujui" | "Ditolak") => void }) {
    const [open, setOpen] = React.useState(false);

    const handleAction = (status: "Disetujui" | "Ditolak") => {
        onUpdateRequest(request.id, status);
        setOpen(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">{request.title}</DialogTitle>
                    <DialogDescription>
                        Pengajuan oleh {request.profiles?.name || 'N/A'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <Badge className={`${getStatusColor(request.status)} col-span-2 w-min`}>{request.status}</Badge>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Nama</span>
                        <span className="col-span-2 font-semibold">{request.profiles?.name || 'N/A'}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">NIP</span>
                        <span className="col-span-2 font-semibold">{request.profiles?.nip || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Tanggal</span>
                        <span className="col-span-2 font-semibold">{format(new Date(request.start_date), 'd MMM', { locale: id })} - {format(new Date(request.end_date), 'd MMM yyyy', { locale: id })}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Durasi</span>
                        <span className="col-span-2 font-semibold">{request.duration} hari</span>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground pt-1">Alasan</span>
                        <p className="col-span-2">{request.reason}</p>
                    </div>
                </div>
                {request.status === 'Menunggu' && (
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleAction("Ditolak")}>
                            <X className="h-4 w-4" />
                            <span className="ml-2">Tolak Pengajuan</span>
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction("Disetujui")}>
                            <Check className="h-4 w-4" />
                            <span className="ml-2">Setujui Pengajuan</span>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
