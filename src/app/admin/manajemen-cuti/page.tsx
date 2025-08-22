
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeaveRequestTable } from "./leave-request-table";
import type { Database } from "@/types/supabase";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "./loading";

export const revalidate = 0;

export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'name' | 'id_pjlp' | 'avatar_url'> | null;
};

const ITEMS_PER_PAGE = 10;

async function getLeaveRequests(status: 'Menunggu' | 'Semua', page: number) {
    const supabase = createClient();
    const offset = (page - 1) * ITEMS_PER_PAGE;

    let query = supabase
        .from('leave_requests')
        .select('*, profiles(name, id_pjlp, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (status !== 'Semua') {
        query = query.eq('status', status);
    }
    
    query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

    const { data, error, count } = await query;
    if (error) {
        console.error(`Error fetching ${status} leave requests:`, error);
        return { requests: [], count: 0 };
    }
    return { requests: data as LeaveRequest[], count: count || 0 };
}

async function LeaveTabs({ 
  searchParams 
} : { 
  searchParams?: { tab?: string; page?: string; }
}) {
  const currentTab = searchParams?.tab === 'semua' ? 'Semua' : 'Menunggu';
  const currentPage = Number(searchParams?.page) || 1;

  const { requests: waitingRequests, count: waitingCount } = await getLeaveRequests('Menunggu', currentTab === 'Menunggu' ? currentPage : 1);
  const { requests: allRequests, count: allCount } = await getLeaveRequests('Semua', currentTab === 'Semua' ? currentPage : 1);

  return (
     <Tabs defaultValue={currentTab.toLowerCase()}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menunggu" asChild><Link href="?tab=menunggu">Menunggu ({waitingCount})</Link></TabsTrigger>
            <TabsTrigger value="semua" asChild><Link href="?tab=semua">Semua ({allCount})</Link></TabsTrigger>
        </TabsList>
        <TabsContent value="menunggu">
            <LeaveRequestTable requests={waitingRequests} />
        </TabsContent>
        <TabsContent value="semua">
            <LeaveRequestTable requests={allRequests} />
        </TabsContent>
    </Tabs>
  )
}


export default function ManajemenCutiPage({
  searchParams
}: {
  searchParams?: {
    tab?: string;
    page?: string;
  }
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Suspense fallback={<Loading />}>
          <LeaveTabs searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
