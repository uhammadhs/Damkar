
import * as React from "react"
import { createClient } from "@/lib/supabase/server";
import { RiwayatClient } from "./riwayat-client";
import type { Database } from "@/types/supabase";

export type LeaveHistoryItem = Pick<
  Database['public']['Tables']['leave_requests']['Row'],
  'id' | 'start_date' | 'end_date' | 'duration' | 'title' | 'reason' | 'status' | 'created_at'
>;

async function getLeaveHistory() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          duration,
          title,
          reason,
          status,
          created_at
        `)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

    if (error) {
        console.error("Error fetching leave history:", error);
        return [];
    }
    
    return data as LeaveHistoryItem[];
}


export default async function RiwayatPage() {
    const history = await getLeaveHistory();
    return <RiwayatClient allLeaveHistory={history} />;
}
