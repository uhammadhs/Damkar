
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  Bell,
  Users,
  LayoutDashboard,
  LineChart,
  BookCopy,
  Moon,
  Sun,
  LogOut,
  CheckCircle2,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import type { AdminNotification } from "./layout"
import { markAdminNotificationsAsRead } from "./actions"

interface AdminLayoutClientProps {
  children: React.ReactNode;
  initialNotifications: AdminNotification[];
  initialNotificationCount: number;
}

export function AdminLayoutClient({ children, initialNotifications, initialNotificationCount }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const supabase = createClient()
  
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [notificationCount, setNotificationCount] = React.useState(initialNotificationCount);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/manajemen-cuti", label: "Manajemen Cuti", icon: BookCopy },
    { href: "/admin/laporan", label: "Laporan", icon: LineChart },
    { href: "/admin/anggota", label: "Anggota", icon: Users },
  ];

  const getPageTitle = () => {
    const activeItem = navItems.find(item => pathname.startsWith(item.href));
    return activeItem?.label || "Admin SIAP CUTI";
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };
  
  const handleNotificationClick = (notificationId: number) => {
    router.push('/admin/manajemen-cuti');
    // Optimistically remove from UI
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const handleOpenNotifications = async (open: boolean) => {
    // When the dropdown opens and there are unread notifications
    if (open && notifications.length > 0) {
      // Get IDs of the notifications currently shown
      const aMomentAgo = Date.now();
      const notificationIds = notifications.map(n => n.id);
      
      // Optimistically clear the count and list
      setNotifications([]);
      setNotificationCount(0);

      // Tell the server to mark these as read
      await markAdminNotificationsAsRead(notificationIds);
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <h1 className="font-headline text-2xl font-semibold text-primary">
            ADMIN SIAP CUTI
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             {navItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
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
            <div className="flex-1 md:hidden">
              <SidebarTrigger />
            </div>
            <div className="hidden flex-1 md:block">
              <h2 className="text-lg font-semibold font-headline">
                {getPageTitle()}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
              </Button>
              <DropdownMenu onOpenChange={handleOpenNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs">
                        {notificationCount}
                      </Badge>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 md:w-96">
                  <DropdownMenuLabel>Notifikasi Baru</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} onSelect={() => handleNotificationClick(notif.id)} className="flex items-start gap-3 whitespace-normal p-3">
                        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                        <div className="grid gap-1">
                           <p className="text-sm font-medium leading-none">
                              {notif.message}
                           </p>
                           <p className="text-xs text-muted-foreground">
                             {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                           </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
                      <p className="mt-2">Tidak ada notifikasi baru.</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" data-ai-hint="male portrait" />
                              <AvatarFallback>A</AvatarFallback>
                          </Avatar>
                          <span className="sr-only">Toggle user menu</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          {/* Mobile Bottom Nav */}
          <footer className="sticky bottom-0 z-10 border-t bg-background/95 p-2 md:hidden">
            <div className="grid grid-cols-4 gap-2">
               {navItems.map(item => (
                   <Button
                    key={item.href}
                    variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                    className="flex h-12 flex-col items-center justify-center gap-1"
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs">{item.label.split(' ')[0]}</span>
                    </Link>
                  </Button>
               ))}
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
