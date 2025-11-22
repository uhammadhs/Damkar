
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import Loading from './loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LaporanClient } from './laporan-client';
import { ReportTable } from './report-table';
import { ExportButton } from './export-button';

export const revalidate = 300; // Cache for 5 minutes

export default async function LaporanPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    year?: string;
  };
}) {
    const query = searchParams?.query || "";
    const selectedYear = Number(searchParams?.year) || new Date().getFullYear();

    // Fetch all distinct years from the database to make the dropdown dynamic
    const supabase = createClient();
    const { data: yearData, error } = await supabase
      .from('leave_requests')
      .select('start_date');

    if (error) {
      console.error("Error fetching years for dropdown:", error);
    }
    
    // Process the years: get unique values, add current year, and sort
    const yearsFromHistory = yearData?.map(item => new Date(item.start_date).getFullYear()) || [];
    const availableYears = Array.from(new Set([...yearsFromHistory, new Date().getFullYear()])).sort((a, b) => b - a);

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
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                        <div className="flex items-center gap-2">
                           <LaporanClient availableYears={availableYears} selectedYear={selectedYear} />
                           <ExportButton year={selectedYear} />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Suspense key={query + selectedYear} fallback={<Loading />}>
                    <ReportTable year={selectedYear} query={query} />
                </Suspense>
            </CardContent>
        </Card>
    );
}
