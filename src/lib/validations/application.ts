import { z } from "zod";

export const applicationSchema = z.object({
  company: z.string().min(1, "Company name is required").max(100),
  role: z.string().min(1, "Job role/title is required").max(100),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  salary: z.string().max(50).optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  locationType: z.enum(["Remote", "Hybrid", "On-site"]),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]),
  appliedDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  contactName: z.string().max(100).optional().or(z.literal("")),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]),
  note: z.string().optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

export type ApplicationInput = {
  company: string;
  role: string;
  jobUrl?: string | null;
  salary?: string | null;
  location?: string | null;
  locationType?: "Remote" | "Hybrid" | "On-site" | null;
  status: "WISHLIST" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate?: string | null;
  notes?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | null;
  contactName?: string | null;
  contactEmail?: string | null;
};

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
