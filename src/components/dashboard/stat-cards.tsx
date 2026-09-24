import React from "react";
import {
  Briefcase,
  Award,
  Send,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardsProps {
  kpis: {
    total: number;
    activePipeline: number;
    submittedCount: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    statusCounts: {
      WISHLIST: number;
      APPLIED: number;
      INTERVIEW: number;
      OFFER: number;
      REJECTED: number;
    };
  };
}

export function StatCards({ kpis }: StatCardsProps) {
  const cards = [
    {
      title: "Total Tracked",
      value: kpis.total,
      subtitle: `${kpis.activePipeline} in active pipeline`,
      icon: Briefcase,
      color: "from-indigo-600 to-blue-600",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/40",
      accent: "border-indigo-500/20",
    },
    {
      title: "Response Rate",
      value: `${kpis.responseRate}%`,
      subtitle: "Employers responding",
      icon: Send,
      color: "from-blue-600 to-cyan-600",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-950/40",
      accent: "border-blue-500/20",
    },
    {
      title: "Interview Rate",
      value: `${kpis.interviewRate}%`,
      subtitle: `${kpis.statusCounts.INTERVIEW + kpis.statusCounts.OFFER} landed interviews`,
      icon: CalendarCheck,
      color: "from-amber-600 to-orange-600",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-950/40",
      accent: "border-amber-500/20",
    },
    {
      title: "Offers Received",
      value: kpis.statusCounts.OFFER,
      subtitle: `${kpis.offerRate}% conversion rate`,
      icon: Award,
      color: "from-emerald-600 to-teal-600",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/40",
      accent: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`border ${card.accent} bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]`}
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
