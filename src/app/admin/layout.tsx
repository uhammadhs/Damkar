
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "./layout-client";
import type { LeaveRequest } from "./manajemen-cuti/page";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();

  // Fetch notifications for the admin
  const { data: notifications, error: notificationsError } = await supabase
    .from('leave_requests')
    .select('id, title, profiles(name)')
    .eq('status', 'Menunggu')
    .order('created_at', { ascending: false })
    .limit(5);

  if (notificationsError) {
    console.error("Error fetching admin notifications:", notificationsError);
  }

  // Fetch count for the badge
  const { count, error: countError } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Menunggu');
  
  if (countError) {
    console.error("Error fetching admin notification count:", countError);
  }
    
  return (
    <AdminLayoutClient 
      notifications={notifications as unknown as LeaveRequest[] || []} 
      notificationCount={count || 0}
    >
      {children}
    </AdminLayoutClient>
  );
}
