
"use client"

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { MonthlyRequestStat } from './page';

const LeaveStatsChart = dynamic(() => import('../laporan/leave-stats-chart').then(mod => mod.LeaveStatsChart), {
  ssr: false,
  loading: () => <div className="flex h-[250px] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>,
});

interface LeaveStatsChartWrapperProps {
  data: MonthlyRequestStat[];
}

export function LeaveStatsChartWrapper({ data }: LeaveStatsChartWrapperProps) {
  return <LeaveStatsChart data={data} />;
}
