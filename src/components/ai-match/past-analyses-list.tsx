import React from "react";
import { Sparkles, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PastAnalysesListProps {
  analyses: Array<{
    id: string;
    matchScore: number;
    missingKeywords: string[];
    strengths: string[];
    improvements: string[];
    summary: string;
    createdAt: Date | string;
    application?: { id: string; company: string; role: string } | null;
  }>;
}

export function PastAnalysesList({ analyses }: PastAnalysesListProps) {
  if (!analyses || analyses.length === 0) return null;

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <CardTitle className="text-base font-bold">Recent AI Match Analyses</CardTitle>
        </div>
        <CardDescription>
          Previously analyzed job postings and tailored resume score reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {a.application ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{a.application.company} — {a.application.role}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      General Resume Evaluation
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {formatDate(a.createdAt)}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                    a.matchScore >= 80
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : a.matchScore >= 60
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                  }`}
                >
                  {a.matchScore}% Match
                </span>
              </div>

              {a.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {a.summary}
                </p>
              )}

              {a.missingKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {a.missingKeywords.slice(0, 3).map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40"
                    >
                      +{kw}
                    </span>
                  ))}
                  {a.missingKeywords.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{a.missingKeywords.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
