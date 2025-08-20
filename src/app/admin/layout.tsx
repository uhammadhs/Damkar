
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "./layout-client";
import type { LeaveRequest } from "./manajemen-cuti/page";

// Store seen notification IDs in-memory on the server.
// In a real-world scenario, you might use a more persistent cache like Redis.
const seenNotifications = new Set<number>();

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: role } = await supabase.rpc('get_user_role');
  if (role !== 'admin') {
      redirect('/dashboard');
  }

  let notifications: LeaveRequest[] = [];
  let notificationCount = 0;

  try {
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('leave_requests')
      .select('id, title, created_at, profiles(name, avatar_url)')
      .eq('status', 'Menunggu')
      .order('created_at', { ascending: false })
      .limit(10);

    if (notificationsError) throw notificationsError;
    
    // Filter out notifications that have already been seen in this session
    notifications = (notificationsData as unknown as LeaveRequest[] || []).filter(n => !seenNotifications.has(n.id));

    // The badge count should reflect all pending requests, not just unseen ones
    const { count, error: countError } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Menunggu');
    
    if (countError) throw countError;
    notificationCount = count || 0;

  } catch(error) {
    console.error("Error fetching admin notifications:", error);
  }
    
  return (
    <AdminLayoutClient 
      initialNotifications={notifications} 
      initialNotificationCount={notificationCount}
    >
      {children}
    </AdminLayoutClient>
  );
}
