"use client";

import * as React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { MatchScoreGauge } from "./match-score-gauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface MatchReportCardProps {
  analysis: {
    matchScore: number;
    missingKeywords: string[];
    strengths: string[];
    improvements: string[];
    summary: string;
    createdAt?: Date | string;
  };
}

export function MatchReportCard({ analysis }: MatchReportCardProps) {
  const [copiedKeyword, setCopiedKeyword] = React.useState<string | null>(null);

  const copyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    toast.success(`Copied "${kw}" to clipboard`);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Top Banner: Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <MatchScoreGauge score={analysis.matchScore} />
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col justify-center bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20 border-indigo-200/60 dark:border-indigo-900/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Executive Evaluation</CardTitle>
              </div>
              <CardDescription>
                AI-powered recruiter perspective on your application fit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {analysis.summary}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Critical Missing Keywords & Strengths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Keywords */}
        <Card className="border-rose-200/70 dark:border-rose-900/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Missing Critical Keywords
                </CardTitle>
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                {analysis.missingKeywords.length} Found
              </span>
            </div>
            <CardDescription>
              Keywords detected in the job description that were absent from your resume. Click to copy and incorporate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyKeyword(kw)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-900/60 transition-all cursor-pointer group"
                    title="Click to copy keyword"
                  >
                    <span>{kw}</span>
                    {copiedKeyword === kw ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Great job! All standard keywords from the posting were found in your resume.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="border-emerald-200/70 dark:border-emerald-900/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Matching Strengths
                </CardTitle>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {analysis.strengths.length} Highlights
              </span>
            </div>
            <CardDescription>
              Strong qualifications and capabilities that closely match the employer&apos;s needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.strengths.length > 0 ? (
              <ul className="space-y-2.5">
                {analysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No major strengths highlighted.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3 Actionable Resume Improvements */}
      <Card className="border-indigo-200/80 dark:border-indigo-900/50 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              3 Targeted Resume Improvements
            </CardTitle>
          </div>
          <CardDescription>
            Concrete adjustments to maximize ATS pass-through and recruiter engagement for this specific role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.improvements.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
