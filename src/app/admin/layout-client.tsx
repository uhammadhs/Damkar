
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Users,
  LayoutDashboard,
  LineChart,
  BookCopy,
  Moon,
  Sun,
  LogOut,
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
import type { LeaveRequest } from "./manajemen-cuti/page"

interface AdminLayoutClientProps {
  children: React.ReactNode;
  notifications: LeaveRequest[];
  notificationCount: number;
}

export function AdminLayoutClient({ children, notifications, notificationCount }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const supabase = createClient()

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard"
    if (pathname.startsWith("/admin/manajemen-cuti")) return "Manajemen Cuti"
    if (pathname.startsWith("/admin/laporan")) return "Laporan"
    if (pathname.startsWith("/admin/anggota")) return "Manajemen Anggota"
    return "Admin SIAP CUTI"
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };
  
  const handleNotificationClick = (notificationId: number) => {
    // Navigate to the management page, a real app could highlight the specific request
    router.push('/admin/manajemen-cuti');
  };

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
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/admin/dashboard"}
                tooltip="Dashboard"
              >
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/manajemen-cuti")}
                tooltip="Manajemen Cuti"
              >
                <Link href="/admin/manajemen-cuti">
                  <BookCopy />
                  <span>Manajemen Cuti</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/laporan")}
                tooltip="Laporan"
              >
                <Link href="/admin/laporan">
                  <LineChart />
                  <span>Laporan</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/anggota")}
                tooltip="Anggota"
              >
                <Link href="/admin/anggota">
                  <Users />
                  <span>Anggota</span>
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
              <DropdownMenu>
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
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} onSelect={() => handleNotificationClick(notif.id)} className="flex flex-col items-start whitespace-normal">
                         <span className="font-semibold">{notif.title}</span>
                         <span className="text-xs text-muted-foreground">
                            Dari: {notif.profiles?.name || 'Anggota'}
                         </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Tidak ada notifikasi baru.
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
              <Button
                variant={pathname === "/admin/dashboard" ? "secondary" : "ghost"}
                className="flex h-12 flex-col items-center justify-center gap-1"
                asChild
              >
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="text-xs">Dashboard</span>
                </Link>
              </Button>
              <Button
                variant={
                  pathname.startsWith("/admin/manajemen-cuti")
                    ? "secondary"
                    : "ghost"
                }
                className="flex h-12 flex-col items-center justify-center gap-1"
                asChild
              >
                <Link href="/admin/manajemen-cuti">
                  <BookCopy className="h-5 w-5" />
                  <span className="text-xs">Cuti</span>
                </Link>
              </Button>
              <Button
                variant={
                  pathname.startsWith("/admin/laporan")
                    ? "secondary"
                    : "ghost"
                }
                className="flex h-12 flex-col items-center justify-center gap-1"
                asChild
              >
                <Link href="/admin/laporan">
                  <LineChart className="h-5 w-5" />
                  <span className="text-xs">Laporan</span>
                </Link>
              </Button>
              <Button
                variant={
                  pathname.startsWith("/admin/anggota")
                    ? "secondary"
                    : "ghost"
                }
                className="flex h-12 flex-col items-center justify-center gap-1"
                asChild
              >
                <Link href="/admin/anggota">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Anggota</span>
                </Link>
              </Button>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
