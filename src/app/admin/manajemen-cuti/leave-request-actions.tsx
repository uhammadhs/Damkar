
"use client"

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X, User, Hash, Calendar, Hourglass, FileText, Paperclip } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateLeaveRequestStatus } from "./actions";
import type { LeaveRequest } from "./page";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

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

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            <div className="pl-6 text-base font-semibold text-foreground">
                {value}
            </div>
        </div>
    )
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
                <DialogContent className="sm:max-w-lg p-0">
                    <DialogHeader className="p-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <DialogTitle className="font-headline text-2xl">{request.title}</DialogTitle>
                                <DialogDescription>
                                    Pengajuan oleh {request.profiles?.name || 'N/A'}
                                </DialogDescription>
                            </div>
                            <Badge className={`${getStatusColor(request.status)}`}>{request.status}</Badge>
                        </div>
                    </DialogHeader>
                    <div className="space-y-6 px-6 pb-6 max-h-[70vh] overflow-y-auto">
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Data Pemohon</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DetailItem icon={User} label="Nama" value={request.profiles?.name || 'N/A'} />
                                <DetailItem icon={Hash} label="ID PJLP" value={request.profiles?.id_pjlp || 'N/A'} />
                            </div>
                        </div>
                        <Separator />
                         <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Detail Pengajuan</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DetailItem 
                                    icon={Calendar} 
                                    label="Tanggal" 
                                    value={`${format(new Date(request.start_date), 'd MMM', { locale: id })} - ${format(new Date(request.end_date), 'd MMM yyyy', { locale: id })}`} 
                                />
                                <DetailItem icon={Hourglass} label="Durasi" value={`${request.duration} hari`} />
                            </div>
                            <div>
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Alasan</span>
                                </div>
                                <p className="pl-6 pt-1 text-base text-foreground bg-muted/50 p-3 rounded-md mt-1">{request.reason}</p>
                            </div>
                            {request.attachment_url && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Paperclip className="h-4 w-4" />
                                        <span>Lampiran</span>
                                    </div>
                                    <div className="pl-6 pt-1 mt-1">
                                        <Button variant="outline" asChild size="sm">
                                            <Link href={request.attachment_url} target="_blank" rel="noopener noreferrer">
                                                <Paperclip className="mr-2 h-4 w-4" />
                                                Lihat Lampiran
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {request.status === 'Menunggu' && (
                        <div className="flex justify-end gap-2 p-4 bg-muted/50 border-t">
                            <Button variant="outline" className="w-full sm:w-auto text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleUpdateRequest("Ditolak")} disabled={isLoading}>
                                {isLoading && action === 'Ditolak' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                                Tolak
                            </Button>
                            <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateRequest("Disetujui")} disabled={isLoading}>
                                {isLoading && action === 'Disetujui' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                Setujui
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
