"use client";

import * as React from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MapPin,
  DollarSign,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  GripVertical,
  Flame,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { updateApplicationStatus, deleteApplication } from "@/actions/applications";
import { formatDate, formatRelativeTime, KANBAN_COLUMNS } from "@/lib/utils";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface KanbanApplication {
  id: string;
  company: string;
  role: string;
  jobUrl?: string | null;
  salary?: string | null;
  location?: string | null;
  locationType?: string | null;
  status: string;
  appliedDate?: Date | string | null;
  notes?: string | null;
  priority?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  order?: number;
  updatedAt?: Date | string;
}

interface KanbanCardProps {
  application: KanbanApplication;
  isOverlay?: boolean;
}

export function KanbanCard({ application, isOverlay = false }: KanbanCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: "Application",
      application,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await updateApplicationStatus(application.id, newStatus);
      if (res.success) {
        toast.success(`Moved to ${newStatus}`);
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Error updating status.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete application for ${application.company}?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await deleteApplication(application.id);
      if (res.success) {
        toast.success("Application deleted.");
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    } catch {
      toast.error("Error deleting application.");
    } finally {
      setIsDeleting(false);
    }
  };

  const priorityColor = {
    HIGH: "text-rose-600 bg-rose-500/10 border-rose-500/30 dark:text-rose-400 dark:bg-rose-950/40",
    MEDIUM: "text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400 dark:bg-amber-950/40",
    LOW: "text-slate-600 bg-slate-500/10 border-slate-500/30 dark:text-slate-400 dark:bg-slate-800",
  }[application.priority || "MEDIUM"];

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-900/90 ${
          isDragging
            ? "opacity-40 border-dashed border-indigo-400 scale-[0.98]"
            : isOverlay
            ? "shadow-2xl border-indigo-500 ring-2 ring-indigo-500/30 rotate-1 scale-105 cursor-grabbing"
            : "border-slate-200/80 hover:border-indigo-400/80 hover:shadow-md dark:border-slate-800"
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Drag Handle & Company Name */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Drag card"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {application.company}
              </h4>
            </div>
          </div>

          {/* Priority & Options Menu */}
          <div className="flex items-center gap-1">
            {application.priority === "HIGH" && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityColor}`}
                title="High Priority Application"
              >
                <Flame className="h-3 w-3 fill-rose-500 text-rose-500" />
                <span>High</span>
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/applications/${application.id}`}
                    className="flex items-center cursor-pointer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 text-indigo-500" />
                    <span>View Timeline & Details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsEditDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Edit Application</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <ArrowRight className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Move Stage</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-40">
                    {KANBAN_COLUMNS.map((col) => (
                      <DropdownMenuItem
                        key={col.id}
                        disabled={col.id === application.status}
                        onClick={() => handleStatusChange(col.id)}
                        className="cursor-pointer"
                      >
                        <span>{col.title}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Role Title */}
        <Link href={`/applications/${application.id}`} className="block mb-3">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-2 hover:underline">
            {application.role}
          </p>
        </Link>

        {/* Badges / Meta Info */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {application.salary && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-medium dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
              <DollarSign className="h-3 w-3 -mr-0.5" />
              {application.salary}
            </span>
          )}
          {application.location && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] dark:bg-slate-800 dark:text-slate-300">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[110px]">{application.location}</span>
            </span>
          )}
          {application.locationType && (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium dark:bg-indigo-950/40 dark:text-indigo-300">
              {application.locationType}
            </span>
          )}
        </div>

        {/* Notes preview if available */}
        {application.notes && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg mb-3">
            &ldquo;{application.notes}&rdquo;
          </p>
        )}

        {/* Footer info: Date & Direct Link */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {application.appliedDate
              ? `Applied ${formatDate(application.appliedDate)}`
              : `Updated ${formatRelativeTime(application.updatedAt)}`}
          </span>

          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Post</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Quick Edit Dialog */}
      <ApplicationFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={application}
      />
    </>
  );
}
