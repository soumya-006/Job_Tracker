"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Search,
  ArrowUpDown,
  Briefcase,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { deleteApplication } from "@/actions/applications";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { ApplicationFormDialog } from "./application-form-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ApplicationListItem {
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
  createdAt?: Date | string;
  updatedAt: Date | string;
}

interface ApplicationListTableProps {
  initialApplications: ApplicationListItem[];
}

export function ApplicationListTable({
  initialApplications,
}: ApplicationListTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"updatedAt" | "appliedDate" | "company" | "salary">("updatedAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [editingApp, setEditingApp] = React.useState<ApplicationListItem | null>(null);

  const filteredApps = React.useMemo(() => {
    return initialApplications
      .filter((app) => {
        const matchesSearch =
          search.trim() === "" ||
          app.company.toLowerCase().includes(search.toLowerCase()) ||
          app.role.toLowerCase().includes(search.toLowerCase()) ||
          (app.location && app.location.toLowerCase().includes(search.toLowerCase())) ||
          (app.notes && app.notes.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus =
          statusFilter === "ALL" || app.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "company") {
          return sortOrder === "asc"
            ? a.company.localeCompare(b.company)
            : b.company.localeCompare(a.company);
        }
        if (sortBy === "appliedDate") {
          const dateA = a.appliedDate ? new Date(a.appliedDate).getTime() : 0;
          const dateB = b.appliedDate ? new Date(b.appliedDate).getTime() : 0;
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [initialApplications, search, statusFilter, sortBy, sortOrder]);

  const handleDelete = async (id: string, company: string) => {
    if (!confirm(`Delete application for ${company}?`)) return;
    try {
      const res = await deleteApplication(id);
      if (res.success) {
        toast.success("Application deleted");
      } else {
        toast.error("Failed to delete application");
      }
    } catch {
      toast.error("Error deleting application");
    }
  };

  const toggleSort = (field: "updatedAt" | "appliedDate" | "company" | "salary") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50/70 dark:bg-slate-800/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Stages ({initialApplications.length})</option>
            <option value="WISHLIST">🟣 Wishlist</option>
            <option value="APPLIED">🔵 Applied</option>
            <option value="INTERVIEW">🟡 Interview</option>
            <option value="OFFER">🟢 Offer</option>
            <option value="REJECTED">🔴 Rejected</option>
          </select>

          {/* New Application Dialog Trigger */}
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

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th
                  className="px-6 py-3.5 cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => toggleSort("company")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company & Role</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Stage</th>
                <th className="px-6 py-3.5">Workplace & Location</th>
                <th className="px-6 py-3.5">Salary</th>
                <th
                  className="px-6 py-3.5 cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => toggleSort("appliedDate")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applied / Updated</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Company & Role */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {app.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                        >
                          {app.company}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {app.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>

                  {/* Workplace & Location */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {app.location || "Remote"}
                      </span>
                      {app.locationType && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {app.locationType}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Salary */}
                  <td className="px-6 py-4">
                    {app.salary ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {app.salary}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {app.appliedDate ? formatDate(app.appliedDate) : "-"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Updated {formatRelativeTime(app.updatedAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                      >
                        <Link href={`/applications/${app.id}`}>Details</Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingApp(app)}>
                            <Edit2 className="mr-2 h-4 w-4 text-blue-500" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          {app.jobUrl && (
                            <DropdownMenuItem asChild>
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                <ExternalLink className="mr-2 h-4 w-4 text-slate-500" />
                                <span>Open Job Post</span>
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(app.id, app.company)}
                            className="text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Briefcase className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No job applications match your filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingApp && (
        <ApplicationFormDialog
          open={!!editingApp}
          onOpenChange={(open) => !open && setEditingApp(null)}
          initialData={editingApp}
        />
      )}
    </div>
  );
}
