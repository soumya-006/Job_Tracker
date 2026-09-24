import React from "react";
import { getApplications } from "@/actions/applications";
import { getPastAnalyses } from "@/actions/ai-match";
import { ResumeMatcherForm } from "@/components/ai-match/resume-matcher-form";
import { PastAnalysesList } from "@/components/ai-match/past-analyses-list";

export const metadata = {
  title: "AI Resume Matcher - JobTrackr",
  description: "AI-powered resume and job description alignment analysis with Gemini.",
};

export default async function AiMatchPage() {
  const [applications, pastAnalyses] = await Promise.all([
    getApplications(),
    getPastAnalyses(),
  ]);

  const simplifiedApps = applications.map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
  }));

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <ResumeMatcherForm applications={simplifiedApps} />
      <PastAnalysesList analyses={pastAnalyses} />
    </div>
  );
}
