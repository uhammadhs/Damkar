
"use client"

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LaporanClient } from './laporan-client';
import { Search } from 'lucide-react';

// This is a new layout file that wraps the report page.
// It provides the consistent Card structure and now also includes the client components
// to prevent layout shifts during hydration.

export default function LaporanLayout({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";

    // The year selection logic is now part of the layout to ensure consistency.
    // The actual data fetching based on the year still happens in the page.
    const selectedYear = Number(searchParams.get("year")) || new Date().getFullYear();
    const availableYears = [selectedYear, selectedYear - 1, selectedYear - 2];

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="font-headline">Laporan Saldo Cuti</CardTitle>
                        <CardDescription>
                            Menampilkan rekapitulasi saldo cuti tahunan untuk setiap anggota.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <form className="w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    name="query"
                                    placeholder="Cari nama atau id pjlp..."
                                    className="pl-8 sm:w-[250px]"
                                    defaultValue={query}
                                />
                            </div>
                        </form>
                        <LaporanClient availableYears={availableYears} selectedYear={selectedYear} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
