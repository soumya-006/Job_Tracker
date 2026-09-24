"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  User,
  Mail,
  History,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { updateApplicationStatus, deleteApplication } from "@/actions/applications";
import { formatDate, formatRelativeTime, KANBAN_COLUMNS } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { ApplicationFormDialog } from "./application-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface StatusHistoryItem {
  id: string;
  applicationId: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  changedAt: Date;
}

export interface ResumeAnalysisItem {
  id: string;
  userId: string;
  applicationId: string | null;
  resumeText: string;
  jobDescription: string;
  matchScore: number;
  missingKeywords: string;
  strengths: string | null;
  improvements: string;
  summary: string | null;
  createdAt: Date;
}

export interface ApplicationDetailData {
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
  statusHistory?: StatusHistoryItem[];
  resumeAnalyses?: ResumeAnalysisItem[];
}

interface ApplicationDetailViewProps {
  application: ApplicationDetailData;
}

export function ApplicationDetailView({ application }: ApplicationDetailViewProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateApplicationStatus(application.id, newStatus, newNote || undefined);
      if (res.success) {
        toast.success(`Stage updated to ${newStatus}`);
        setNewNote("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Error updating status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the application for ${application.company}?`)) {
      return;
    }
    try {
      const res = await deleteApplication(application.id);
      if (res.success) {
        toast.success("Application deleted.");
        router.push("/applications");
      } else {
        toast.error("Failed to delete application.");
      }
    } catch {
      toast.error("Error deleting application.");
    }
  };

  const stages = ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER"];
  const currentStageIndex = stages.indexOf(application.status);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Applications</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/ai-match?appId=${application.id}&company=${encodeURIComponent(
              application.company
            )}&role=${encodeURIComponent(application.role)}`}
          >
            <Button variant="gradient" size="sm" className="gap-1.5 shadow-pink-500/20">
              <Sparkles className="h-4 w-4" />
              <span>Analyze Resume with AI</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="gap-1.5"
          >
            <Edit2 className="h-4 w-4 text-blue-500" />
            <span>Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Header Hero Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/25">
              {application.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {application.company}
                </h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
                {application.role}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                {application.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {application.location} ({application.locationType || "Remote"})
                  </span>
                )}
                {application.salary && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-3.5 w-3.5" />
                    {application.salary}
                  </span>
                )}
                {application.appliedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Applied {formatDate(application.appliedDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stage Switcher */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Change Pipeline Stage
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between w-full h-11 rounded-xl">
                  <span className="flex items-center gap-2">
                    <StatusBadge status={application.status} showIcon={false} />
                  </span>
                  <span className="text-xs text-slate-400">Change ▾</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {KANBAN_COLUMNS.map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => handleStatusChange(col.id)}
                    disabled={isUpdatingStatus || col.id === application.status}
                    className="cursor-pointer"
                  >
                    <span>{col.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold mt-1"
              >
                <span>View Job Posting</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Stage Flow Stepper */}
        {application.status !== "REJECTED" ? (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-4 gap-2">
              {stages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;
                return (
                  <div key={stage} className="flex flex-col gap-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCurrent
                          ? "bg-indigo-600 shadow-md shadow-indigo-500/40"
                          : isPassed
                          ? "bg-indigo-400 dark:bg-indigo-700"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "text-indigo-600 dark:text-indigo-400 font-black"
                          : isPassed
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-300">
            This application is marked as Rejected. Keep your momentum going with other active opportunities!
          </div>
        )}
      </div>

      {/* Detail Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Timeline & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status History Timeline */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-base font-bold">Status History & Timeline</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  application.statusHistory.map((history: StatusHistoryItem) => (
                    <div key={history.id} className="relative group">
                      <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 dark:border-slate-900 shadow" />
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            {history.fromStatus && (
                              <>
                                <StatusBadge status={history.fromStatus} showIcon={false} />
                                <span className="text-xs text-slate-400">→</span>
                              </>
                            )}
                            <StatusBadge status={history.toStatus} />
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(history.changedAt)} ({formatRelativeTime(history.changedAt)})
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No status updates logged yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes & Interview Prep */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-base font-bold">Application Notes</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-8 text-xs text-indigo-600 dark:text-indigo-400"
                >
                  Edit Notes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {application.notes ? (
                <div className="whitespace-pre-wrap rounded-xl bg-slate-50/80 p-4 text-sm text-slate-700 dark:bg-slate-800/40 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
                  {application.notes}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                  <p className="text-xs text-slate-400">
                    No notes added yet. Record interview talking points, recruiter questions, and salary target notes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    + Add Notes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Recruiter Info & AI Analyses */}
        <div className="space-y-6">
          {/* Recruiter / Contact Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base font-bold">Point of Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.contactName || application.contactEmail ? (
                <>
                  {application.contactName && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>{application.contactName}</span>
                    </div>
                  )}
                  {application.contactEmail && (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a href={`mailto:${application.contactEmail}`} className="hover:underline">
                        {application.contactEmail}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400">
                  No recruiter or contact specified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Match Reports Linked to this Job */}
          <Card className="border-pink-500/20 bg-gradient-to-b from-pink-500/5 to-transparent dark:from-pink-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  <CardTitle className="text-base font-bold">AI Resume Match</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.resumeAnalyses && application.resumeAnalyses.length > 0 ? (
                application.resumeAnalyses.map((analysis: ResumeAnalysisItem) => (
                  <div
                    key={analysis.id}
                    className="p-3.5 rounded-xl border border-pink-200/60 bg-white/80 dark:border-pink-900/40 dark:bg-slate-900/80 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Match Score
                      </span>
                      <span className="text-sm font-black text-pink-600 dark:text-pink-400">
                        {analysis.matchScore}%
                      </span>
                    </div>
                    {analysis.summary && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {analysis.summary}
                      </p>
                    )}
                    <div className="text-[10px] text-slate-400 pt-1">
                      Analyzed on {formatDate(analysis.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compare your resume against this job description to see missing keywords and actionable improvements.
                  </p>
                  <Link
                    href={`/ai-match?appId=${application.id}&company=${encodeURIComponent(
                      application.company
                    )}&role=${encodeURIComponent(application.role)}`}
                  >
                    <Button variant="gradient" size="sm" className="w-full text-xs gap-1.5 shadow-pink-500/20">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Run AI Match Now</span>
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <ApplicationFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={application}
      />
    </div>
  );
}
