import { z } from "zod";

export const aiMatchRequestSchema = z.object({
  applicationId: z.string().optional(),
  resumeText: z.string().min(50, "Resume text must be at least 50 characters"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
});

export const aiMatchResponseSchema = z.object({
  matchScore: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()).length(3),
  summary: z.string(),
});

export type AiMatchRequest = z.infer<typeof aiMatchRequestSchema>;
export type AiMatchResponse = z.infer<typeof aiMatchResponseSchema>;
