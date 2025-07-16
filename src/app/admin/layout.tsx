
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Users,
  Home,
  LayoutDashboard,
  LineChart,
  BookCopy,
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard Admin"
    if (pathname.startsWith("/admin/manajemen-cuti")) return "Manajemen Cuti"
    if (pathname.startsWith("/admin/laporan")) return "Laporan"
    if (pathname.startsWith("/admin/anggota")) return "Manajemen Anggota"
    return "Admin SIAP CUTI"
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
        <SidebarFooter>
          {/* Can add logout button or other footer items here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold font-headline">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <p className="hidden text-sm text-muted-foreground md:block">
              Selamat Datang, Admin!
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
                   <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs">2</Badge>
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Pengajuan Cuti dari Anggota 1</DropdownMenuItem>
                <DropdownMenuItem>Pengajuan Cuti dari Anggota 4</DropdownMenuItem>
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
      </SidebarInset>
    </SidebarProvider>
  )
}

    