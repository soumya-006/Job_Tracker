import React from "react";
import Link from "next/link";
import { getApplications } from "@/actions/applications";
import { ApplicationListTable } from "@/components/applications/application-list-table";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { Button } from "@/components/ui/button";
import { Briefcase, Kanban, Plus } from "lucide-react";

export const metadata = {
  title: "All Applications - JobTrackr",
  description: "Comprehensive table and list view of all tracked job opportunities.",
};

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              All Job Applications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter by stage, sort by salary or date, and edit your opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/kanban">
            <Button variant="outline" size="sm" className="gap-1.5 bg-white dark:bg-slate-900">
              <Kanban className="h-4 w-4 text-purple-500" />
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

      {/* Applications Table */}
      <ApplicationListTable initialApplications={applications} />
    </div>
  );
}
