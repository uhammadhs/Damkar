
"use server"

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import type { LeaveRequest } from "./page";
import { LeaveRequestActions } from "./leave-request-actions";

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

export async function LeaveRequestTable({ requests }: { requests: LeaveRequest[] }) {
    if (requests.length === 0) {
        return <p className="py-10 text-center text-muted-foreground">Tidak ada pengajuan cuti yang cocok.</p>
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
                        <CardFooter className="flex justify-end p-4 pt-2">
                            <LeaveRequestActions request={req} />
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
                                    <LeaveRequestActions request={req} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
