
"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  
  return (
    <Select value={String(selectedYear)} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Pilih Tahun" />
        </SelectTrigger>
        <SelectContent>
            {(availableYears.length > 0 ? availableYears : [currentYear]).map(year => (
                 <SelectItem key={year} value={String(year)}>Tahun {year}</SelectItem>
            ))}
             {!availableYears.includes(currentYear) && <SelectItem value={String(currentYear)}>Tahun {currentYear}</SelectItem>}
        </SelectContent>
    </Select>
  );
}
