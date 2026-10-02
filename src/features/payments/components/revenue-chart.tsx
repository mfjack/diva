"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import type { Cents } from "@/lib/money";
import type { MonthlyRevenue } from "../types";

const chartConfig = {
  receivedCents: { label: "Recebido", color: "var(--chart-1)" },
  pendingCents: { label: "A receber", color: "var(--chart-4)" },
} satisfies ChartConfig;

type RevenueChartProps = {
  data: MonthlyRevenue[];
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-56 w-full"
      aria-label="Receita dos últimos meses"
    >
      <BarChart data={data} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {chartConfig[name as keyof typeof chartConfig]?.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(Number(value) as Cents)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="receivedCents"
          stackId="revenue"
          fill="var(--color-receivedCents)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="pendingCents"
          stackId="revenue"
          fill="var(--color-pendingCents)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
