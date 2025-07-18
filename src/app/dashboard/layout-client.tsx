
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import {
  Bell,
  History,
  LayoutDashboard,
  User,
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
import { markUserNotificationsAsRead } from "./actions"

type Notification = {
  id: number;
  title: string;
  status: string;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialNotifications: Notification[];
  initialNotificationCount: number;
}

export function DashboardLayoutClient({ children, initialNotifications, initialNotificationCount }: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const supabase = createClient()
  
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [notificationCount, setNotificationCount] = React.useState(initialNotificationCount);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  };
  
  const handleNotificationClick = (notificationId: number) => {
    router.push('/dashboard/riwayat');
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };
  
  const handleOpenNotifications = async (open: boolean) => {
    if (open && notificationCount > 0) {
      await markUserNotificationsAsRead();
      // Optimistically clear notifications
      setNotifications([]);
      setNotificationCount(0);
    }
  }
  
  const getStatusInfo = (status: string) => {
    switch (status) {
        case 'Disetujui':
            return { text: 'disetujui', color: 'text-green-500' };
        case 'Ditolak':
            return { text: 'ditolak', color: 'text-destructive' };
        default:
            return { text: 'diperbarui', color: 'text-muted-foreground' };
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <h1 className="font-headline text-2xl font-semibold text-primary">
            SIAP CUTI
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/dashboard/riwayat")}
                tooltip="Riwayat"
              >
                <Link href="/dashboard/riwayat">
                  <History />
                  <span>Riwayat Cuti</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/dashboard/profil")}
                tooltip="Profil"
              >
                <Link href="/dashboard/profil">
                  <User />
                  <span>Profil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
                Dashboard
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
                    notifications.map((notif) => {
                      const statusInfo = getStatusInfo(notif.status);
                      return (
                        <DropdownMenuItem key={notif.id} onSelect={() => handleNotificationClick(notif.id)} className="flex items-start gap-3 whitespace-normal p-3">
                          <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusInfo.color.replace('text-', 'bg-')}`} />
                          <div className="grid gap-1">
                              <p className="text-sm font-medium leading-none">
                                Pengajuan Anda <span className="font-bold">"{notif.title}"</span> telah <span className={`font-bold ${statusInfo.color}`}>{statusInfo.text}</span>.
                              </p>
                          </div>
                        </DropdownMenuItem>
                      )
                    })
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
                              <AvatarImage src="https://placehold.co/40x40.png" alt="Anggota" data-ai-hint="male portrait" />
                              <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span className="sr-only">Toggle user menu</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Anggota</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profil">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      </DropdownMenuItem>
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
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className="flex h-12 flex-col items-center justify-center gap-1"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="text-xs">Dashboard</span>
                </Link>
              </Button>
              <Button
                variant={
                  pathname.startsWith("/dashboard/riwayat")
                    ? "secondary"
                    : "ghost"
                }
                className="flex h-12 flex-col items-center justify-center gap-1"
                asChild
              >
                <Link href="/dashboard/riwayat">
                  <History className="h-5 w-5" />
                  <span className="text-xs">Riwayat</span>
                </Link>
              </Button>
              <Button
                variant={
                  pathname.startsWith("/dashboard/profil")
                    ? "secondary"
                    : "ghost"
                }
                className="flex h-12 flex-col items-center justify-center gap-1"
                asChild
              >
                <Link href="/dashboard/profil">
                  <User className="h-5 w-5" />
                  <span className="text-xs">Profil</span>
                </Link>
              </Button>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
