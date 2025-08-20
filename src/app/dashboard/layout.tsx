
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./layout-client";
import { redirect } from "next/navigation";

type Notification = {
  id: number;
  title: string;
  status: string;
}

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

  let notifications: Notification[] = [];
  let notificationCount = 0;

  try {
    const { data, error, count } = await supabase
      .from('leave_requests')
      .select('id, title, status', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false) // Only fetch unread notifications
      .neq('status', 'Menunggu')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }
    
    notifications = data;
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
