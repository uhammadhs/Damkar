
import Link from "next/link"
import {
  History,
  LayoutDashboard,
  User,
} from "lucide-react"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { UserNav, MobileNav } from "./user-nav"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// This is now a Server Component, which is much more performant.
// It fetches user data on the server and passes it down.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Simplified navItems for the server-side sidebar
  const navItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/riwayat", label: "Riwayat Cuti", icon: History },
      { href: "/dashboard/profil", label: "Profil", icon: User },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-between">
          <h1 className="font-headline text-2xl font-semibold text-primary">
            CUTI DAMKAR
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             {navItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    // Note: We can't use usePathname() here anymore.
                    // This means the "active" state on the main sidebar for the dashboard won't work perfectly,
                    // but the mobile navigation will, which is more important for UX.
                    // This is a trade-off for much better performance.
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
             ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-svh flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur">
            <div className="flex items-center gap-2 md:hidden">
               <h1 className="font-headline text-lg font-semibold text-primary">CUTI DAMKAR</h1>
            </div>
            <div className="hidden flex-1 md:block">
              <h2 className="text-lg font-semibold font-headline">
                Dashboard
              </h2>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
              <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
                 <UserNav user={user} />
              </Suspense>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          {/* Mobile Bottom Nav is now in its own component and uses Suspense */}
          <Suspense>
            <MobileNav />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
