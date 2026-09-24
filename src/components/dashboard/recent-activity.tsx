import React from "react";
import Link from "next/link";
import { History, ArrowRight, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/applications/status-badge";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface RecentHistoryItem {
  id: string;
  applicationId: string;
  fromStatus?: string | null;
  toStatus: string;
  changedAt: Date | string;
  application?: {
    company: string;
    role: string;
  } | null;
}

export interface RecentAppItem {
  id: string;
  company: string;
  role: string;
  status: string;
  salary?: string | null;
  updatedAt: Date | string;
}

interface RecentActivityProps {
  recentHistories: RecentHistoryItem[];
  recentApplications: RecentAppItem[];
}

export function RecentActivity({ recentHistories, recentApplications }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Status Updates */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Recent Stage Transitions
              </CardTitle>
            </div>
            <Link href="/kanban" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Board →
            </Link>
          </div>
          <CardDescription>Real-time log of application progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentHistories.length > 0 ? (
              recentHistories.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {h.application?.company}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                      {h.application?.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={h.toStatus} />
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(h.changedAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No activity recorded yet. Move cards on the Kanban board to track progress.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Pipeline Focus */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Active Priority Pipeline
              </CardTitle>
            </div>
            <Link href="/applications" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              All Applications →
            </Link>
          </div>
          <CardDescription>High-priority applications requiring follow-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-xs group"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                      {app.company}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                      {app.role} {app.salary ? `• ${app.salary}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={app.status} />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No active applications. Start by adding your dream companies!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
