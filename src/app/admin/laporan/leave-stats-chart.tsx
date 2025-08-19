
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, YAxis, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
    color: "hsl(var(--chart-2))",
  },
  Ditolak: {
    label: "Ditolak",
    color: "hsl(var(--destructive))",
  },
   Menunggu: {
    label: "Menunggu",
    color: "hsl(var(--accent))",
  },
}

export function LeaveStatsChart({ data }: LeaveStatsChartProps) {
  return (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={data}>
                 <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Legend />
                <Bar dataKey="Menunggu" stackId="a" fill="var(--color-Menunggu)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Ditolak" stackId="a" fill="var(--color-Ditolak)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Disetujui" stackId="a" fill="var(--color-Disetujui)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
  )
}
