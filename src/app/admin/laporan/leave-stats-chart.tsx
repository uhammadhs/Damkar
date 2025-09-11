
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, YAxis, Legend } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

type MonthlyRequestStat = {
    month: string;
    Disetujui: number;
    Ditolak: number;
    Menunggu: number;
}

interface LeaveStatsChartProps {
    data: MonthlyRequestStat[];
}

const chartConfig = {
  Disetujui: {
    label: "Disetujui",
    color: "hsl(var(--chart-1))",
  },
  Ditolak: {
    label: "Ditolak",
    color: "hsl(var(--chart-2))",
  },
   Menunggu: {
    label: "Menunggu",
    color: "hsl(var(--chart-3))",
  },
}

export function LeaveStatsChart({ data }: LeaveStatsChartProps) {
  return (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
                 <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="Menunggu" stackId="a" fill="var(--color-Menunggu)" radius={0} />
                <Bar dataKey="Ditolak" stackId="a" fill="var(--color-Ditolak)" radius={0} />
                <Bar dataKey="Disetujui" stackId="a" fill="var(--color-Disetujui)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
  )
}
