"use client";

import * as React from "react";
import confetti from "canvas-confetti";

interface MatchScoreGaugeProps {
  score: number;
}

export function MatchScoreGauge({ score }: MatchScoreGaugeProps) {
  React.useEffect(() => {
    if (score >= 80) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti errors in non-standard canvas environments
      }
    }
  }, [score]);

  // Color logic
  const getColor = (val: number) => {
    if (val >= 80) return { stroke: "#10b981", text: "text-emerald-600 dark:text-emerald-400", label: "Strong Fit" };
    if (val >= 60) return { stroke: "#f59e0b", text: "text-amber-600 dark:text-amber-400", label: "Moderate Fit" };
    return { stroke: "#f43f5e", text: "text-rose-600 dark:text-rose-400", label: "Needs Tailoring" };
  };

  const { stroke, text, label } = getColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="relative flex items-center justify-center">
        <svg className="h-36 w-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-black tracking-tight ${text}`}>
            {score}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            ATS Match
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
          score >= 80
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            : score >= 60
            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
        }`}>
          {label}
        </span>
      </div>
    </div>
  );
}
