
import { createClient } from "@/lib/supabase/server";
import { LaporanClient } from "./laporan-client";
import type { Database } from "@/types/supabase";

export type MemberLeaveData = {
    id: string;
    name: string | null;
    nip: string | null;
    avatar_url: string | null;
    total_days: number;
    used_days: number;
    year: number;
}

async function getLeaveBalances() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('leave_balances')
        .select(`
            year,
            total_days,
            used_days,
            profiles!inner (id, name, nip, avatar_url, role)
        `)
        .eq('profiles.role', 'anggota') // Filter by role 'anggota'
        .order('year', { ascending: false });

    if (error) {
        console.error("Error fetching leave balances for report:", error);
        return [];
    }

    if (!data) {
        return [];
    }
    
    // The filter is now done in the query, but we still need to format the data.
    // The !inner join ensures item.profiles will not be null.
    const formattedData = data
        .map(item => ({
            id: item.profiles!.id,
            name: item.profiles!.name,
            nip: item.profiles!.nip,
            avatar_url: item.profiles!.avatar_url,
            total_days: item.total_days,
            used_days: item.used_days,
            year: item.year,
        }));
        
    return formattedData;
}


export default async function LaporanPage() {
    const data = await getLeaveBalances();
    return <LaporanClient allData={data} />;
}
