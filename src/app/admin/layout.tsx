
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "./layout-client";
import type { LeaveRequest } from "./manajemen-cuti/page";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If no user is found, redirect to the login page.
    redirect('/');
  }

  // Double-check if the user is an admin. Redirect if not.
  const { data: role } = await supabase.rpc('get_user_role');
  if (role !== 'admin') {
      redirect('/dashboard'); // Redirect non-admins to their dashboard
  }

  let notifications: LeaveRequest[] = [];
  let notificationCount = 0;

  try {
    // Fetch notifications for the admin
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('leave_requests')
      .select('id, title, profiles(name)')
      .eq('status', 'Menunggu')
      .order('created_at', { ascending: false })
      .limit(5);

    if (notificationsError) throw notificationsError;
    notifications = notificationsData as unknown as LeaveRequest[] || [];

    // Fetch count for the badge
    const { count, error: countError } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Menunggu');
    
    if (countError) throw countError;
    notificationCount = count || 0;

  } catch(error) {
    console.error("Error fetching admin notifications:", error);
    // Gracefully handle error, UI will show 0 notifications
  }
    
  return (
    <AdminLayoutClient 
      notifications={notifications} 
      notificationCount={notificationCount}
    >
      {children}
    </AdminLayoutClient>
  );
}
