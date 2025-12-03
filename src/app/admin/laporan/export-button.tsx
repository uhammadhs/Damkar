
"use client"

import * as React from 'react';
import { utils, writeFile } from 'xlsx';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { getLeaveRequestsForExport } from './actions';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
    year: number;
    className?: string;
}

export function ExportButton({ year, className }: ExportButtonProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsLoading(true);
        
        const result = await getLeaveRequestsForExport(year);

        if (!result.success || !result.data) {
            toast({
                title: 'Ekspor Gagal',
                description: result.message || 'Tidak dapat mengambil data untuk membuat laporan.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        if (result.data.length === 0) {
             toast({
                title: 'Tidak Ada Data',
                description: `Tidak ada riwayat cuti yang ditemukan untuk tahun ${year}.`,
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        try {
            // Create a new workbook
            const workbook = utils.book_new();
            // Convert the data to a worksheet
            const worksheet = utils.json_to_sheet(result.data);
            
            // Set column widths
            const columnWidths = [
                { wch: 25 }, // Nama Anggota
                { wch: 15 }, // ID PJLP
                { wch: 30 }, // Judul Pengajuan
                { wch: 15 }, // Tanggal Mulai
                { wch: 15 }, // Tanggal Selesai
                { wch: 12 }, // Durasi
                { wch: 12 }, // Status
                { wch: 18 }, // Tanggal Pengajuan
                { wch: 40 }, // Alasan
            ];
            worksheet['!cols'] = columnWidths;

            // Append the worksheet to the workbook
            utils.book_append_sheet(workbook, worksheet, `Laporan Cuti ${year}`);
            
            // Generate the Excel file and trigger a download
            writeFile(workbook, `Laporan_Cuti_CUTI_DAMKAR_${year}.xlsx`);

             toast({
                title: 'Ekspor Berhasil',
                description: `Laporan untuk tahun ${year} telah berhasil dibuat.`,
            });
        } catch (error) {
            console.error("Error generating Excel file:", error);
            toast({
                title: 'Ekspor Gagal',
                description: 'Terjadi kesalahan saat membuat file Excel.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isLoading}
            variant="outline"
            className={className}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileDown className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Mempersiapkan...' : 'Export ke Excel'}
        </Button>
    );
}
