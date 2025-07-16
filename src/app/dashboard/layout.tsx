
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  History,
  Home,
  LayoutDashboard,
  User,
  Moon,
  Sun,
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
  SidebarFooter,
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

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
        <SidebarFooter>
          {/* Can add logout button or other footer items here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold font-headline">
              Dashboard Anggota
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <p className="hidden text-sm text-muted-foreground md:block">
              Selamat Pagi, Anggota!
            </p>
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
                   <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs">1</Badge>
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Pengajuan cuti Anda telah disetujui.</DropdownMenuItem>
                 <DropdownMenuItem>Password akan segera berakhir.</DropdownMenuItem>
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
      </SidebarInset>
    </SidebarProvider>
  )
}

    