
"use client"

import * as React from 'react'
import { Bell } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { markAdminNotificationsAsRead } from './actions'
import { useToast } from '@/hooks/use-toast'
import type { Notification } from './notification-content'
import { NotificationContent } from './notification-content'
import { useIsMobile } from '@/hooks/use-mobile'

async function getInitialNotifications(): Promise<Notification[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error("Error fetching initial notifications:", error)
    return []
  }
  return data
}

export function NotificationBell() {
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchNotifications = async () => {
      const initialData = await getInitialNotifications()
      setNotifications(initialData)
      setUnreadCount(initialData.filter(n => !n.is_read).length)
    }
    fetchNotifications()
  }, [])
  
  React.useEffect(() => {
      const supabase = createClient()
      const channel = supabase
        .channel('realtime-admin-notifications')
        .on(
            'postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'notifications', 
            }, 
            (payload) => {
                 // Re-fetch all notifications to update the list and count
                 const fetchAndSet = async () => {
                    const freshNotifications = await getInitialNotifications();
                    setNotifications(freshNotifications);
                    setUnreadCount(freshNotifications.filter(n => !n.is_read).length);
                 }
                 fetchAndSet();
            }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
  }, [])


  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length > 0) {
      const result = await markAdminNotificationsAsRead(unreadIds);
       if (result.success) {
            setUnreadCount(0);
            const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
            setNotifications(updatedNotifications);
            toast({
                title: "Sukses",
                description: "Semua notifikasi telah ditandai sebagai dibaca."
            })
        } else {
            toast({
                title: "Gagal",
                description: result.message,
                variant: "destructive",
            });
        }
    }
  }

  const handleNotificationClick = (notificationId: number) => {
    const unreadIds = notifications.filter(n => n.id === notificationId && !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
        markAdminNotificationsAsRead(unreadIds); // Fire-and-forget
    }
    router.push('/admin/manajemen-cuti');
    setIsOpen(false);
  }

  const triggerButton = (
    <Button variant="ghost" size="icon" className="relative rounded-full">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        )}
    </Button>
  );

  const contentProps = {
    notifications,
    unreadCount,
    onNotificationClick: handleNotificationClick,
    onMarkAllAsRead: handleMarkAllAsRead,
    onViewAllClick: () => {
        router.push('/admin/manajemen-cuti');
        setIsOpen(false);
    }
  }

  if (isMobile) {
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {triggerButton}
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Notifikasi</SheetTitle>
                </SheetHeader>
                <NotificationContent {...contentProps} />
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <NotificationContent {...contentProps} />
      </PopoverContent>
    </Popover>
  )
}
