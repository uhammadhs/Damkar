
"use client"

import * as React from 'react'
import { Bell, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { markAdminNotificationsAsRead } from './actions'
import { useToast } from '@/hooks/use-toast'

type Notification = {
  id: number;
  message: string;
  created_at: string;
  leave_request_id: number;
  is_read: boolean;
}

async function getInitialNotifications(userId: string): Promise<Notification[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
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
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [userId, setUserId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const supabase = createClient()
    const fetchUserAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const initialData = await getInitialNotifications(user.id)
        setNotifications(initialData)
        setUnreadCount(initialData.filter(n => !n.is_read).length)
      }
    }
    fetchUserAndNotifications()
  }, [])
  
  React.useEffect(() => {
      if (!userId) return;

      const supabase = createClient()
      const channel = supabase
        .channel(`realtime-notifications:${userId}`)
        .on(
            'postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'notifications', 
                filter: `user_id=eq.${userId}` 
            }, 
            (payload) => {
                // Refetch all notifications to get the most up-to-date list and count
                 const fetchAndSet = async () => {
                    const freshNotifications = await getInitialNotifications(userId);
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
  }, [userId])


  const handleNotificationClick = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length > 0) {
      const result = await markAdminNotificationsAsRead(unreadIds);
       if (result.success) {
            setUnreadCount(0);
            const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
            setNotifications(updatedNotifications);
        } else {
            toast({
                title: "Gagal",
                description: result.message,
                variant: "destructive",
            });
        }
    }
    router.push('/admin/manajemen-cuti');
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {unreadCount}
                </span>
            )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 font-medium border-b">
            Notifikasi
        </div>
        <div className="flex flex-col">
            {notifications.length > 0 ? (
                notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className="flex items-start gap-4 p-4 hover:bg-muted cursor-pointer"
                        onClick={handleNotificationClick}
                    >
                        {!notif.is_read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        <div className={`flex-1 ${notif.is_read ? 'opacity-60' : ''}`}>
                            <p className="text-sm">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                 <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                    <Check className="h-10 w-10 mb-2"/>
                    <p className="text-sm font-medium">Tidak ada notifikasi</p>
                    <p className="text-xs">Semua sudah terbaca.</p>
                </div>
            )}
        </div>
         {notifications.length > 0 && (
            <div 
                className="p-3 border-t text-center text-sm text-primary hover:underline cursor-pointer"
                onClick={() => router.push('/admin/manajemen-cuti')}
            >
                Lihat Semua Pengajuan
            </div>
         )}
      </PopoverContent>
    </Popover>
  )
}
