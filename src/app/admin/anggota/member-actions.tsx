
"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast";
import { deleteMember } from "./actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Profile } from "./page";
import { EditMemberDialog } from "./edit-member-dialog";


export function EditMemberAction({ member }: { member: Profile }) {
    return <EditMemberDialog member={member} />;
}

export function DeleteMemberAction({ id }: { id: string }) {
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus anggota ini? Aksi ini tidak dapat dibatalkan.")) {
          return;
        }
        const result = await deleteMember(id);
        if (result.success) {
          toast({
            title: "Sukses",
            description: result.message,
          });
        } else {
          toast({
            title: "Gagal",
            description: result.message,
            variant: "destructive",
          });
        }
    };
    
    return (
        <DropdownMenuItem className="text-destructive" onSelect={handleDelete}>
            Hapus
        </DropdownMenuItem>
    )
}
