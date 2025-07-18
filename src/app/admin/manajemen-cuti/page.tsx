
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveRequestTable } from "./leave-request-table";
import type { Database } from "@/types/supabase";

export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'name' | 'nip' | 'avatar_url'> | null;
};

export default async function ManajemenCutiPage() {
  const supabase = createClient();
  
  const { data: leaveRequests, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      profiles (name, nip, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching leave requests:", error);
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>Gagal memuat data pengajuan. Silakan coba lagi nanti.</p>
        </CardContent>
      </Card>
    );
  }

  const waitingRequests = leaveRequests.filter(req => req.status === "Menunggu");
  const allRequests = leaveRequests;

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="menunggu">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menunggu">Menunggu ({waitingRequests.length})</TabsTrigger>
            <TabsTrigger value="semua">Semua ({allRequests.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="menunggu">
            <LeaveRequestTable initialRequests={waitingRequests} />
          </TabsContent>
          <TabsContent value="semua">
            <LeaveRequestTable initialRequests={allRequests} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
