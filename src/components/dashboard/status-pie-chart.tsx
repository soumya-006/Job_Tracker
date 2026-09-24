"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers } from "lucide-react";

interface StatusPieChartProps {
  data: { name: string; value: number; color: string }[];
}

const emptySubscribe = () => () => {};

export function StatusPieChart({ data }: StatusPieChartProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (!mounted) {
    return (
      <Card className="h-[380px] flex items-center justify-center">
        <div className="h-64 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl mx-6" />
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Pipeline Distribution
            </CardTitle>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {total} Total
          </span>
        </div>
        <CardDescription>Current distribution across all pipeline stages</CardDescription>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-xs text-slate-400">
            No applications tracked yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
