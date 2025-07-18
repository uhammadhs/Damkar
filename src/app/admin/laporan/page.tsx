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
            profiles (id, name, nip, avatar_url)
        `)
        .order('year', { ascending: false });

    if (error) {
        console.error("Error fetching leave balances for report:", error);
        return [];
    }

    if (!data) {
        return [];
    }
    
    const formattedData = data
        .filter(item => item.profiles) // Hanya proses item yang memiliki profil terkait
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
