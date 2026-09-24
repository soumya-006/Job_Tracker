"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface WeeklyTrendChartProps {
  data: { weekLabel: string; count: number; interviews: number }[];
}

const emptySubscribe = () => () => {};

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Application Velocity
            </CardTitle>
          </div>
        </div>
        <CardDescription>
          New job applications and interview milestones tracked over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis
                dataKey="weekLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconType="circle"
              />
              <Bar
                dataKey="count"
                name="Applications"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="interviews"
                name="Interviews / Offers"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
