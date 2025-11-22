'use server'

import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export async function getLeaveRequestsForExport(year: number) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('leave_requests')
        .select(`
            start_date,
            end_date,
            created_at,
            title,
            reason,
            duration,
            status,
            profiles (
                name,
                id_pjlp
            )
        `)
        .gte('start_date', `${year}-01-01T00:00:00.000Z`)
        .lte('start_date', `${year}-12-31T23:59:59.999Z`)
        .order('profiles(name)', { ascending: true })
        .order('start_date', { ascending: true });

    if (error) {
        console.error('Error fetching data for export:', error);
        return { success: false, message: 'Gagal mengambil data untuk ekspor.', data: null };
    }

    // Format data for Excel
    const formattedData = data.map(req => ({
        'Nama Anggota': req.profiles?.name ?? 'N/A',
        'ID PJLP': req.profiles?.id_pjlp ?? 'N/A',
        'Judul Pengajuan': req.title,
        'Tanggal Mulai': format(new Date(req.start_date), 'dd-MM-yyyy'),
        'Tanggal Selesai': format(new Date(req.end_date), 'dd-MM-yyyy'),
        'Durasi (Hari)': req.duration,
        'Status': req.status,
        'Tanggal Pengajuan': format(new Date(req.created_at), 'dd-MM-yyyy HH:mm'),
        'Alasan': req.reason,
    }));

    return { success: true, data: formattedData, message: 'Data siap untuk diekspor.' };
}
