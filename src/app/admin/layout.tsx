
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import {
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { NotificationBell } from "./notification-bell"

// This layout is a client component because it uses many hooks for interactivity.
// The critical role-based redirection is handled by the server-side middleware.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const [supabase] = React.useState(() => createClient())

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/manajemen-cuti", label: "Manajemen Cuti", icon: BookCopy },
    { href: "/admin/laporan", label: "Laporan", icon: LineChart },
    { href: "/admin/anggota", label: "Anggota", icon: Users },
  ];

  const getPageTitle = () => {
    const activeItem = navItems.find(item => pathname.startsWith(item.href));
    return activeItem?.label || "Admin CUTI DAMKAR";
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-between">
          <h1 className="font-headline text-2xl font-semibold text-primary">
            ADMIN CUTI DAMKAR
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
             <div className="flex items-center gap-2 md:hidden">
              <h1 className="font-headline text-lg font-semibold text-primary">ADMIN CUTI DAMKAR</h1>
            </div>
            <div className="hidden flex-1 md:block">
              <h2 className="text-lg font-semibold font-headline">
                {getPageTitle()}
              </h2>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
              <NotificationBell />
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
                      <Button variant="ghost" size="icon" className="rounded-full">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=Admin`} alt="Admin" />
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
