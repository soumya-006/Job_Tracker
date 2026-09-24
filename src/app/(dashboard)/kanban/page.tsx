import React from "react";
import { getApplications } from "@/actions/applications";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Kanban as KanbanIcon } from "lucide-react";

export const metadata = {
  title: "Kanban Pipeline - JobTrackr",
  description: "Interactive drag-and-drop job application tracker.",
};

export default async function KanbanPage() {
  const applications = await getApplications();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <KanbanIcon className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Application Pipeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag and drop cards across pipeline stages to track status and progress.
          </p>
        </div>

        <ApplicationFormDialog
          trigger={
            <Button variant="gradient" size="sm" className="gap-1.5 shadow-indigo-500/20">
              <Plus className="h-4 w-4" />
              <span>Track Application</span>
            </Button>
          }
        />
      </div>

      {/* Kanban Board */}
      <KanbanBoard initialApplications={applications} />
    </div>
  );
}
