import Link from "next/link";
import {
  Layers,
  Sparkles,
  Kanban,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-[#08090e] selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-[140px]" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-500 rounded-full blur-[130px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              JobTrackr
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm" className="font-bold text-xs sm:text-sm shadow-indigo-500/20">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          {/* Badge Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-bold mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
            <span>Powered by Next.js 15 App Router & Gemini 2.5 AI</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.1]">
            Track Job Applications.{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Match Resumes with AI.
            </span>{" "}
            Land Offers.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            The all-in-one job search command center. Organize your pipeline with a fluid drag-and-drop Kanban board, analyze resume fit with instant AI scoring, and visualize interview velocity.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="gradient"
                size="lg"
                className="w-full h-12 px-8 font-bold text-base gap-2 shadow-xl shadow-indigo-500/25"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 px-6 font-semibold text-base bg-white dark:bg-slate-900 shadow-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 shadow-sm hover:border-indigo-400 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-4 shadow-inner">
                <Kanban className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Drag & Drop Kanban Pipeline
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Move job cards across Wishlist, Applied, Interview, Offer, and Rejected stages with instant optimistic feedback powered by dnd-kit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 shadow-sm hover:border-pink-400 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 mb-4 shadow-inner">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Resume Match & ATS Optimization
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluate your resume text against any job posting. Get a match score (0-100), missing keywords, and 3 actionable improvements using Gemini AI.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 shadow-sm hover:border-emerald-400 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4 shadow-inner">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Analytics & Status History Timeline
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track response rates, interview conversion percentages, weekly velocity charts, and comprehensive timelines of status updates with notes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/60 dark:border-slate-800/80 dark:bg-slate-950/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 JobTrackr. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium">
            Built with Next.js 15, TypeScript, Tailwind CSS, Prisma & Google Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
