"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Sparkles, Send, CalendarCheck, Award, XCircle } from "lucide-react";
import { type ApplicationStatusType } from "@/lib/utils";
import { KanbanCard, type KanbanApplication } from "./kanban-card";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  id: ApplicationStatusType;
  title: string;
  subtitle?: string;
  applications: KanbanApplication[];
}

const columnIcons: Record<ApplicationStatusType, React.ReactNode> = {
  WISHLIST: <Sparkles className="h-4 w-4 text-purple-500" />,
  APPLIED: <Send className="h-4 w-4 text-blue-500" />,
  INTERVIEW: <CalendarCheck className="h-4 w-4 text-amber-500" />,
  OFFER: <Award className="h-4 w-4 text-emerald-500" />,
  REJECTED: <XCircle className="h-4 w-4 text-rose-500" />,
};

export function KanbanColumn({
  id,
  title,
  applications,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  const icon = columnIcons[id];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-1 min-w-[300px] max-w-[360px] rounded-2xl border transition-colors bg-slate-50/70 dark:bg-slate-900/40 p-3 h-full max-h-[calc(100vh-12rem)] ${
        isOver
          ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20"
          : "border-slate-200/80 dark:border-slate-800/80"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-slate-700 shadow-sm border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {applications.length}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <ApplicationFormDialog
          defaultStatus={id}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 shadow-none hover:shadow-sm"
              title={`Add card to ${title}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {/* Cards List / Drop Target */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4 min-h-[160px] pr-1.5">
        <SortableContext
          items={applications.map((app) => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard key={app.id} application={app} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-8 text-center px-4">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              No applications in {title}
            </p>
            <ApplicationFormDialog
              defaultStatus={id}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline h-7"
                >
                  + Add Application
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
