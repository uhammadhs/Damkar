
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./layout-client";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";

export type UserNotification = Pick<
  Database['public']['Tables']['leave_requests']['Row'],
  'id' | 'title' | 'status'
>;


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  let notifications: UserNotification[] = [];
  let notificationCount = 0;

  try {
    const { data, error, count } = await supabase
      .from('leave_requests')
      .select('id, title, status', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read_by_user', false) // Use the new dedicated column
      .neq('status', 'Menunggu')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }
    
    notifications = data || [];
    notificationCount = count || 0; 

  } catch (error) {
    console.error("Error fetching user notifications:", error);
  }
    
  return (
    <DashboardLayoutClient 
      initialNotifications={notifications}
      initialNotificationCount={notificationCount}
    >
      {children}
    </DashboardLayoutClient>
  );
}
