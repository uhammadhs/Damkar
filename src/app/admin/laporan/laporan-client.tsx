
"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LaporanClientProps {
    availableYears: number[];
    selectedYear: number;
}

export function LaporanClient({ availableYears, selectedYear }: LaporanClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentYear = new Date().getFullYear();

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('year', year);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Note: Search functionality would require a client-side implementation
    // or a full page reload with search params. For this performance optimization,
    // we'll keep the year filter which is server-side.

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                   placeholder="Cari nama atau NIP..."
                   className="pl-8 sm:w-[250px]"
                   // value={searchTerm}
                   // onChange={(e) => setSearchTerm(e.target.value)}
                   // Search is disabled for this server-side-first implementation
                   disabled 
               />
           </div>
           <Select value={String(selectedYear)} onValueChange={handleYearChange}>
               <SelectTrigger className="w-full sm:w-[180px]">
                   <SelectValue placeholder="Pilih Tahun" />
               </SelectTrigger>
               <SelectContent>
                   {(availableYears.length > 0 ? availableYears : [currentYear]).map(year => (
                        <SelectItem key={year} value={String(year)}>Tahun {year}</SelectItem>
                   ))}
               </SelectContent>
           </Select>
       </div>
    )
}
