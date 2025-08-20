
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "./layout-client";

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
    
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
