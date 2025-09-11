
"use client"

import { Line, LineChart, CartesianGrid, XAxis, Tooltip, YAxis } from "recharts"
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
            <LineChart accessibilityLayer data={data} margin={{ top: 20, left: -10, right: 10 }}>
                 <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis allowDecimals={false} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Line
                    dataKey="Menunggu"
                    type="monotone"
                    stroke="var(--color-Menunggu)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-Menunggu)", r: 4 }}
                    activeDot={{ r: 6 }}
                />
                 <Line
                    dataKey="Ditolak"
                    type="monotone"
                    stroke="var(--color-Ditolak)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-Ditolak)", r: 4 }}
                    activeDot={{ r: 6 }}
                />
                 <Line
                    dataKey="Disetujui"
                    type="monotone"
                    stroke="var(--color-Disetujui)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-Disetujui)", r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ChartContainer>
  )
}
