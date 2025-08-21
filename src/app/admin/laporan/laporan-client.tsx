
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

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const yearsToDisplay = [...new Set([...availableYears, selectedYear])].sort((a, b) => b - a);

  return (
    <Select value={String(selectedYear)} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {yearsToDisplay.map(year => (
                 <SelectItem key={year} value={String(year)}>Tahun {year}</SelectItem>
            ))}
        </SelectContent>
    </Select>
  );
}
