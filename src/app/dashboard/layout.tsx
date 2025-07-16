
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  History,
  Home,
  LayoutDashboard,
  User,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  };

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
