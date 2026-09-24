"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateApplicationStatus, reorderApplications } from "@/actions/applications";
import { KANBAN_COLUMNS, type ApplicationStatusType } from "@/lib/utils";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard, type KanbanApplication } from "./kanban-card";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  initialApplications: KanbanApplication[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = React.useState<KanbanApplication[]>(initialApplications);
  const [prevInitial, setPrevInitial] = React.useState(initialApplications);
  const [activeItem, setActiveItem] = React.useState<KanbanApplication | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");

  if (initialApplications !== prevInitial) {
    setPrevInitial(initialApplications);
    setApplications(initialApplications);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // 6px movement before drag starts so clicks on buttons/links work seamlessly
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter applications by search and priority
  const filteredApps = React.useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === "ALL" || app.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [applications, searchQuery, priorityFilter]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = applications.find((app) => app.id === active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeApp = applications.find((a) => a.id === activeId);
    if (!activeApp) return;

    // Check if dropping over another card or directly over a column
    const isOverAColumn = KANBAN_COLUMNS.some((col) => col.id === overId);
    const overApp = applications.find((a) => a.id === overId);

    const targetStatus = isOverAColumn
      ? (overId as ApplicationStatusType)
      : (overApp?.status as ApplicationStatusType);

    if (!targetStatus || activeApp.status === targetStatus) return;

    // Optimistically change column status
    setApplications((prev) =>
      prev.map((app) =>
        app.id === activeId ? { ...app, status: targetStatus } : app
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeApp = applications.find((a) => a.id === activeId);
    if (!activeApp) return;

    const isOverAColumn = KANBAN_COLUMNS.some((col) => col.id === overId);
    const overApp = applications.find((a) => a.id === overId);

    const targetStatus = isOverAColumn
      ? (overId as ApplicationStatusType)
      : ((overApp?.status || activeApp.status) as ApplicationStatusType);

    const activeIndex = applications.findIndex((a) => a.id === activeId);
    let newIndex = activeIndex;

    if (!isOverAColumn && overApp) {
      const overIndex = applications.findIndex((a) => a.id === overId);
      newIndex = overIndex;
    }

    // Move in local array
    const reordered = arrayMove(applications, activeIndex, newIndex).map(
      (app, idx) => ({
        ...app,
        status: app.id === activeId ? targetStatus : app.status,
        order: idx,
      })
    );

    setApplications(reordered);

    // Persist to database via server actions
    try {
      if (activeApp.status !== targetStatus) {
        await updateApplicationStatus(activeId, targetStatus);
        toast.success(`Application moved to ${targetStatus}`);
      }

      await reorderApplications(
        reordered
          .filter((a) => a.status === targetStatus)
          .map((item, idx) => ({
            id: item.id,
            status: item.status,
            order: idx,
          }))
      );
    } catch (err) {
      console.error("Failed to persist card move:", err);
      toast.error("Failed to update status on server.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by company, role, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50/70 dark:bg-slate-800/50"
          />
        </div>

        {/* Priority Filter Pills & Add Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === p
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {p === "ALL" ? "All" : p === "HIGH" ? "🔥 High" : p === "MEDIUM" ? "⚡ Med" : "☕ Low"}
              </button>
            ))}
          </div>

          <ApplicationFormDialog
            trigger={
              <Button variant="gradient" size="sm" className="gap-1.5 shadow-indigo-500/20 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                <span>New Job</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Dnd Kanban Columns Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[600px]">
          {KANBAN_COLUMNS.map((col) => {
            const columnApps = filteredApps.filter(
              (app) => app.status === col.id
            );
            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                subtitle={col.subtitle}
                applications={columnApps}
              />
            );
          })}
        </div>

        {/* Drag Overlay for smooth preview */}
        <DragOverlay>
          {activeItem ? <KanbanCard application={activeItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
