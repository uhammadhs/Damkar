
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./layout-client";
import type { Database } from "@/types/supabase";

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

  let notifications: Notification[] = [];
  let notificationCount = 0;

  if (user) {
    // A more complex query would be needed for a real "is_read" system,
    // but for now we show recent status changes.
    const { data, error } = await supabase
      .from('leave_requests')
      .select('id, title, status')
      .eq('user_id', user.id)
      .neq('status', 'Menunggu') // Filter out pending requests
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching user notifications:", error);
    } else {
      notifications = data;
      // In a real app, you'd count only unread notifications.
      // For this demo, we'll count all non-pending ones.
      notificationCount = data.length; 
    }
  }
    
  return (
    <DashboardLayoutClient 
      notifications={notifications}
      notificationCount={notificationCount}
    >
      {children}
    </DashboardLayoutClient>
  );
}
