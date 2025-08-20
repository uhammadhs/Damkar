
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "./layout-client";
import type { Database } from "@/types/supabase";

export type AdminNotification = Database['public']['Tables']['notifications']['Row'];

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

  let notifications: AdminNotification[] = [];
  let notificationCount = 0;

  try {
    // Fetch unread notifications and their count for the current admin user
    const { data: notificationsData, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    notifications = notificationsData || [];
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
