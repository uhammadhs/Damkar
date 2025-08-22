
"use client"

import * as React from "react";
import type { Profile } from "./page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ProfileActions } from "./profile-actions";

export function ProfileClient({ profile }: { profile: Profile }) {

    const getAvatarFallback = (name: string | null) => {
        if (!name) return "??";
        const parts = name.split(" ");
        if (parts.length > 1 && parts[0] && parts[1]) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} data-ai-hint="male portrait" />
            <AvatarFallback>{getAvatarFallback(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 w-full space-y-4 text-left">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p className="font-semibold">{profile.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID PJLP</p>
                <p className="font-semibold">{profile.id_pjlp || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nomor HP</p>
                <p className="font-semibold">{profile.phone || "-"}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">{profile.email || "-"}</p>
              </div>
            </div>
            <Separator className="!my-6" />
            <ProfileActions profile={profile} />
          </div>
        </div>
    )
}
