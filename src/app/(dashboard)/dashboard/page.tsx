import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { getDashboardAnalytics } from "@/actions/analytics";
import { StatCards } from "@/components/dashboard/stat-cards";
import { WeeklyTrendChart } from "@/components/dashboard/weekly-trend-chart";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Kanban } from "lucide-react";

export const metadata = {
  title: "Dashboard - JobTrackr",
  description: "Track your job search metrics, pipeline velocity, and active opportunities.",
};

export default async function DashboardPage() {
  const session = await auth();
  const analytics = await getDashboardAnalytics();

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "Candidate";

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s a breakdown of your career opportunities and interview velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/ai-match">
            <Button variant="outline" size="sm" className="gap-1.5 bg-white dark:bg-slate-900">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span>AI Resume Match</span>
            </Button>
          </Link>

          <Link href="/kanban">
            <Button variant="outline" size="sm" className="gap-1.5 bg-white dark:bg-slate-900">
              <Kanban className="h-4 w-4 text-indigo-500" />
              <span>Kanban Board</span>
            </Button>
          </Link>

          <ApplicationFormDialog
            trigger={
              <Button variant="gradient" size="sm" className="gap-1.5 shadow-indigo-500/20">
                <Plus className="h-4 w-4" />
                <span>Add Application</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Metric KPI Cards */}
      <StatCards kpis={analytics.kpis} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyTrendChart data={analytics.weeklyTrends} />
        </div>
        <div className="lg:col-span-1">
          <StatusPieChart data={analytics.statusBreakdown} />
        </div>
      </div>

      {/* Recent Activity & Priorities */}
      <RecentActivity
        recentHistories={analytics.recentStatusHistories}
        recentApplications={analytics.recentApplications}
      />
    </div>
  );
}
