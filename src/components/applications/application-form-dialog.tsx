"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Building2, MapPin, DollarSign, Link as LinkIcon, Calendar, User, Mail, FileText } from "lucide-react";
import { toast } from "sonner";
import { createApplication, updateApplication } from "@/actions/applications";
import { applicationSchema, type ApplicationFormValues } from "@/lib/validations/application";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface ApplicationFormData {
  id?: string;
  company?: string;
  role?: string;
  jobUrl?: string | null;
  salary?: string | null;
  location?: string | null;
  locationType?: string | null;
  status?: string | null;
  appliedDate?: Date | string | null;
  notes?: string | null;
  priority?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
}

interface ApplicationFormDialogProps {
  initialData?: ApplicationFormData;
  defaultStatus?: "WISHLIST" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ApplicationFormDialog({
  initialData,
  defaultStatus = "WISHLIST",
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: ApplicationFormDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const isEdit = !!initialData?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: initialData?.company || "",
      role: initialData?.role || "",
      jobUrl: initialData?.jobUrl || "",
      salary: initialData?.salary || "",
      location: initialData?.location || "",
      locationType: (initialData?.locationType as "Remote" | "Hybrid" | "On-site") || "Remote",
      status: (initialData?.status as "WISHLIST" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED") || defaultStatus,
      appliedDate: initialData?.appliedDate
        ? new Date(initialData.appliedDate).toISOString().split("T")[0]
        : defaultStatus === "APPLIED"
        ? new Date().toISOString().split("T")[0]
        : "",
      notes: initialData?.notes || "",
      priority: (initialData?.priority as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
      contactName: initialData?.contactName || "",
      contactEmail: initialData?.contactEmail || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        company: initialData?.company || "",
        role: initialData?.role || "",
        jobUrl: initialData?.jobUrl || "",
        salary: initialData?.salary || "",
        location: initialData?.location || "",
        locationType: (initialData?.locationType as "Remote" | "Hybrid" | "On-site") || "Remote",
        status: (initialData?.status as "WISHLIST" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED") || defaultStatus,
        appliedDate: initialData?.appliedDate
          ? new Date(initialData.appliedDate).toISOString().split("T")[0]
          : defaultStatus === "APPLIED"
          ? new Date().toISOString().split("T")[0]
          : "",
        notes: initialData?.notes || "",
        priority: (initialData?.priority as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
        contactName: initialData?.contactName || "",
        contactEmail: initialData?.contactEmail || "",
      });
    }
  }, [isOpen, initialData, defaultStatus, reset]);

  const currentStatus = watch("status");
  const currentLocationType = watch("locationType");
  const currentPriority = watch("priority");

  const onSubmit = async (values: ApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && initialData?.id) {
        const res = await updateApplication(initialData.id, values);
        if (res.success) {
          toast.success("Application updated successfully!");
          setIsOpen(false);
          onSuccess?.();
        } else {
          toast.error(res.error || "Failed to update application.");
        }
      } else {
        const res = await createApplication(values);
        if (res.success) {
          toast.success("Job application tracked!");
          setIsOpen(false);
          reset();
          onSuccess?.();
        } else {
          toast.error(res.error || "Failed to create application.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="gradient" className="gap-2 shadow-indigo-500/20">
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl sm:p-6 p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Building2 className="h-5 w-5 text-indigo-500" />
            {isEdit ? "Edit Job Application" : "Track New Job Application"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update details, compensation, timeline, and notes for this opportunity."
              : "Enter details for the position you're tracking or applying to."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Company <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Stripe, Google, Linear"
                {...register("company")}
                className={errors.company ? "border-rose-500 ring-rose-500/20" : ""}
              />
              {errors.company && (
                <p className="text-xs text-rose-500">{errors.company.message}</p>
              )}
            </div>

            {/* Role Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Job Title / Role <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                {...register("role")}
                className={errors.role ? "border-rose-500 ring-rose-500/20" : ""}
              />
              {errors.role && (
                <p className="text-xs text-rose-500">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pipeline Stage
              </label>
              <select
                {...register("status")}
                value={currentStatus}
                onChange={(e) => setValue("status", e.target.value as ApplicationFormValues["status"])}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <option value="WISHLIST">🟣 Wishlist</option>
                <option value="APPLIED">🔵 Applied</option>
                <option value="INTERVIEW">🟡 Interview</option>
                <option value="OFFER">🟢 Offer</option>
                <option value="REJECTED">🔴 Rejected</option>
              </select>
            </div>

            {/* Location Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Workplace Type
              </label>
              <select
                {...register("locationType")}
                value={currentLocationType}
                onChange={(e) => setValue("locationType", e.target.value as ApplicationFormValues["locationType"])}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <option value="Remote">🌐 Remote</option>
                <option value="Hybrid">🏢 Hybrid</option>
                <option value="On-site">📍 On-site</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                {...register("priority")}
                value={currentPriority}
                onChange={(e) => setValue("priority", e.target.value as ApplicationFormValues["priority"])}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <option value="HIGH">🔥 High</option>
                <option value="MEDIUM">⚡ Medium</option>
                <option value="LOW">☕ Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Salary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                Salary / Compensation
              </label>
              <Input
                placeholder="e.g. $160k - $180k"
                {...register("salary")}
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Location
              </label>
              <Input
                placeholder="e.g. San Francisco / Remote"
                {...register("location")}
              />
            </div>

            {/* Applied Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Applied Date
              </label>
              <Input
                type="date"
                {...register("appliedDate")}
              />
            </div>
          </div>

          {/* Job URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
              Job Posting URL
            </label>
            <Input
              type="url"
              placeholder="https://jobs.example.com/posting/123"
              {...register("jobUrl")}
              className={errors.jobUrl ? "border-rose-500" : ""}
            />
            {errors.jobUrl && (
              <p className="text-xs text-rose-500">{errors.jobUrl.message}</p>
            )}
          </div>

          {/* Contact Person Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Contact / Recruiter Name
              </label>
              <Input
                placeholder="e.g. Alex Rivera (Lead Recruiter)"
                {...register("contactName")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Contact Email
              </label>
              <Input
                type="email"
                placeholder="alex.r@company.com"
                {...register("contactEmail")}
                className={errors.contactEmail ? "border-rose-500" : ""}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Notes & Next Steps
            </label>
            <Textarea
              placeholder="Interview details, referral contacts, questions to prepare, recruiter talking points..."
              rows={3}
              {...register("notes")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="gap-2 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Save Changes" : "Create Application"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
