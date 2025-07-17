
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
    // If no user is found, redirect to the login page.
    // This is a crucial security measure.
    redirect('/');
  }

  let notifications: Notification[] = [];
  let notificationCount = 0;

  try {
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
      throw error;
    }
    
    notifications = data;
    // In a real app, you'd count only unread notifications.
    // For this demo, we'll count all non-pending ones.
    notificationCount = data.length; 

  } catch (error) {
    console.error("Error fetching user notifications:", error);
    // Gracefully handle the error, the page will render without notifications
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
