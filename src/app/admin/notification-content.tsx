
"use client"

import * as React from 'react'
import { Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export type Notification = {
  id: number;
  message: string;
  created_at: string;
  leave_request_id: number;
  is_read: boolean;
}

interface NotificationContentProps {
    notifications: Notification[];
    unreadCount: number;
    onNotificationClick: (id: number) => void;
    onMarkAllAsRead: () => void;
    onViewAllClick: () => void;
}

export function NotificationContent({ 
    notifications, 
    unreadCount, 
    onNotificationClick, 
    onMarkAllAsRead,
    onViewAllClick,
}: NotificationContentProps) {
  return (
    <>
        <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-medium">Notifikasi</h4>
            {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs text-primary">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Tandai semua dibaca
                </Button>
            )}
        </div>
        <ScrollArea className="h-[320px]">
            <div className="flex flex-col">
                {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                        <React.Fragment key={notif.id}>
                            <div 
                                className="flex items-start gap-4 p-4 hover:bg-muted cursor-pointer"
                                onClick={() => onNotificationClick(notif.id)}
                            >
                                {!notif.is_read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                                <div className={`flex-1 ${notif.is_read ? 'opacity-60' : ''}`}>
                                    <p className="text-sm">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                    </p>
                                </div>
                            </div>
                            {index < notifications.length - 1 && <Separator />}
                        </React.Fragment>
                    ))
                ) : (
                     <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground h-full">
                        <Check className="h-10 w-10 mb-2"/>
                        <p className="text-sm font-medium">Tidak ada notifikasi</p>
                        <p className="text-xs">Semua sudah terbaca.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
         {notifications.length > 0 && (
            <div 
                className="p-3 border-t text-center text-sm text-primary hover:underline cursor-pointer"
                onClick={onViewAllClick}
            >
                Lihat Semua Pengajuan
            </div>
         )}
    </>
  )
}
