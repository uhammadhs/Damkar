"use client"

import * as React from "react"
import { Pie, PieChart, Tooltip } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface LeaveDonutChartProps {
  total: number
  used: number
}

export function LeaveDonutChart({ total, used }: LeaveDonutChartProps) {
  const remaining = total - used
  const chartData = [
    { name: "Sisa Cuti", value: remaining, fill: "hsl(var(--primary))" },
    { name: "Cuti Terpakai", value: used, fill: "hsl(var(--secondary))" },
  ]

  const chartConfig = {
    value: {
      label: "Hari",
    },
    sisa: {
      label: "Sisa Cuti",
      color: "hsl(var(--primary))",
    },
    terpakai: {
      label: "Cuti Terpakai",
      color: "hsl(var(--secondary))",
    },
  } satisfies ChartConfig

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="aspect-square w-full max-w-[250px]"
      >
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="dot" />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
            labelLine={false}
            paddingAngle={5}
            cornerRadius={8}
          >
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="font-headline text-5xl font-bold tracking-tighter text-primary">
          {remaining}
        </span>
        <span className="text-sm text-muted-foreground">Hari Tersisa</span>
      </div>
    </div>
  )
}
