
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import {
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  History,
} from "lucide-react"
import { useTheme } from "next-themes"

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
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

// This is a Client Component that handles user interaction
// It receives the user data as a prop from the parent Server Component.
export function UserNav({ user }: { user: SupabaseUser | null }) {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh();
  };

  const getAvatarFallback = (name: string | null) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
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
              <AvatarImage src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.user_metadata?.name || '??')}`} alt={user?.user_metadata?.name} />
              <AvatarFallback>{getAvatarFallback(user?.user_metadata?.name)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.user_metadata?.name || 'Anggota'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profil">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export function MobileNav() {
    const pathname = usePathname();
    const navItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/riwayat", label: "Riwayat", icon: History },
      { href: "/dashboard/profil", label: "Profil", icon: UserIcon },
    ];

    return (
        <footer className="sticky bottom-0 z-10 border-t bg-background/95 p-2 md:hidden">
            <div className="grid grid-cols-3 gap-2">
            {navItems.map(item => {
                // For mobile, we can be more specific. `startsWith` is good for nested routes
                // but for a flat bottom nav, direct equality is often better.
                const isActive = pathname === item.href;
                return (
                <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                        "flex h-12 flex-col items-center justify-center gap-1",
                        isActive && "text-primary"
                    )}
                    asChild
                >
                    <Link href={item.href}>
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs">{item.label}</span>
                    </Link>
                </Button>
                )
            })}
            </div>
        </footer>
    );
}
