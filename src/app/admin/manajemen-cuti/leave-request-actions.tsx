
"use client"

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateLeaveRequestStatus } from "./actions";
import type { LeaveRequest } from "./page";

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Menunggu':
            return 'bg-accent text-accent-foreground hover:bg-accent/80';
        case 'Disetujui':
            return 'bg-green-600 text-white hover:bg-green-600/80';
        case 'Ditolak':
            return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
        default:
            return 'bg-gray-500 text-white hover:bg-gray-500/80';
    }
}

export function LeaveRequestActions({ request }: { request: LeaveRequest }) {
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [action, setAction] = React.useState<"Disetujui" | "Ditolak" | null>(null);
    
    const handleUpdateRequest = async (status: "Disetujui" | "Ditolak") => {
        setIsLoading(true);
        setAction(status);
        const result = await updateLeaveRequestStatus(request.id, status);
        
        if (result.success) {
          toast({
              title: "Sukses",
              description: result.message,
          });
        } else {
          toast({
            title: "Gagal",
            description: result.message,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        setAction(null);
        setOpen(false);
    };

    return (
        <div className="flex justify-end gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Lihat Detail</Button>
                </DialogTrigger>
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
                            <span className="text-sm font-medium text-muted-foreground">ID PJLP</span>
                            <span className="col-span-2 font-semibold">{request.profiles?.id_pjlp || 'N/A'}</span>
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
                            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleUpdateRequest("Ditolak")} disabled={isLoading}>
                                {isLoading && action === 'Ditolak' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                <span className="ml-2">Tolak Pengajuan</span>
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateRequest("Disetujui")} disabled={isLoading}>
                                {isLoading && action === 'Disetujui' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                <span className="ml-2">Setujui Pengajuan</span>
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {request.status === 'Menunggu' && (
                <div className="hidden md:flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleUpdateRequest("Ditolak")} disabled={isLoading}>
                        {isLoading && action === 'Ditolak' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        <span className="sr-only">Tolak</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleUpdateRequest("Disetujui")} disabled={isLoading}>
                        {isLoading && action === 'Disetujui' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span className="sr-only">Setujui</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
