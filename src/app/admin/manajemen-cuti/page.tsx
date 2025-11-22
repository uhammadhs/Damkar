
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeaveRequestTable } from "./leave-request-table";
import type { Database } from "@/types/supabase";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "./loading";

// By removing `export const revalidate = 0`, we opt into Next.js's default static caching.
// Revalidation will be handled on-demand by `revalidatePath` in our server actions.

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

async function WaitingTabContent({ currentPage }: { currentPage: number }) {
  const { requests: waitingRequests } = await getLeaveRequests('Menunggu', currentPage);
  return <LeaveRequestTable requests={waitingRequests} />;
}

async function AllTabContent({ currentPage }: { currentPage: number }) {
  const { requests: allRequests } = await getLeaveRequests('Semua', currentPage);
  return <LeaveRequestTable requests={allRequests} />;
}

export default async function ManajemenCutiPage({
  searchParams
}: {
  searchParams?: {
    tab?: string;
    page?: string;
  }
}) {
  const currentTab = searchParams?.tab === 'semua' ? 'semua' : 'menunggu';
  const currentPage = Number(searchParams?.page) || 1;

  // We fetch counts separately and in parallel for the tab triggers
  const supabase = createClient();
  const waitingCountPromise = supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'Menunggu');
  const allCountPromise = supabase.from('leave_requests').select('id', { count: 'exact', head: true });

  const [
    { count: waitingCount },
    { count: allCount }
  ] = await Promise.all([waitingCountPromise, allCountPromise]);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue={currentTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="menunggu" asChild><Link href="?tab=menunggu">Menunggu ({waitingCount ?? 0})</Link></TabsTrigger>
                <TabsTrigger value="semua" asChild><Link href="?tab=semua">Semua ({allCount ?? 0})</Link></TabsTrigger>
            </TabsList>
            <TabsContent value="menunggu">
              <Suspense key={`menunggu-${currentPage}`} fallback={<Loading />}>
                <WaitingTabContent currentPage={currentPage} />
              </Suspense>
            </TabsContent>
            <TabsContent value="semua">
              <Suspense key={`semua-${currentPage}`} fallback={<Loading />}>
                <AllTabContent currentPage={currentPage} />
              </Suspense>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
