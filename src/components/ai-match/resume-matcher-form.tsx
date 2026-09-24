"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  FileText,
  Briefcase,
  Loader2,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Building2,
  UploadCloud,
  X,
  Check,
  FileType,
} from "lucide-react";
import { toast } from "sonner";
import { analyzeResumeWithAI } from "@/actions/ai-match";
import { MatchReportCard } from "./match-report-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type AiMatchResponse } from "@/lib/validations/ai";

interface ResumeMatcherFormProps {
  applications: Array<{ id: string; company: string; role: string }>;
}

const SAMPLE_RESUME = `Jane Doe
Senior Full-Stack Engineer | San Francisco, CA | jane.doe@example.com | linkedin.com/in/janedoe

SUMMARY:
Results-driven Senior Full Stack Software Engineer with 6+ years of experience designing, architecting, and scaling enterprise web applications. Proficient in React, Next.js, TypeScript, Node.js, and PostgreSQL. Proven track record of improving site performance by 40% and leading high-velocity engineering teams.

EXPERIENCE:
Senior Software Engineer | CloudScale Tech (2022 - Present)
• Architected modular micro-frontend architecture using Next.js App Router, React 19, and TypeScript, serving 500k+ daily active users.
• Designed and optimized relational PostgreSQL database schemas with Prisma ORM, reducing query latency by 35%.
• Implemented client-side caching strategies with TanStack Query and state machines, enhancing user responsiveness.
• Mentored 4 junior engineers, organized bi-weekly architecture reviews, and instituted automated Jest & Cypress testing pipelines.

Full Stack Developer | NexaStream Labs (2019 - 2022)
• Developed responsive SaaS user interfaces using React, Redux, Tailwind CSS, and RESTful APIs.
• Built secure JWT authentication microservices using Node.js and Express with OAuth 2.0 integration.
• Containerized development and staging environments with Docker, shortening deployment onboarding time by 50%.

TECHNICAL SKILLS:
Languages: TypeScript, JavaScript (ES6+), Python, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Prisma, GraphQL
Databases & Tools: PostgreSQL, SQLite, Redis, Docker, Git, Jest, AWS (S3, Lambda)`;

const SAMPLE_JOB = `Role: Senior Full Stack Engineer (Next.js / TypeScript)
Company: Stripe
Location: Remote / San Francisco, CA

ABOUT THE ROLE:
We are looking for a Senior Full Stack Engineer to join our Core Developer Experience & Platform team. You will lead the development of mission-critical dashboards, payments interfaces, and developer workflows using modern web technologies.

RESPONSIBILITIES:
• Design, build, and deploy reliable, scalable web applications using Next.js 15, React 19, TypeScript, and Server Components.
• Architect robust distributed systems and APIs integrating with PostgreSQL databases and Redis caching layers.
• Implement end-to-end security protocols, OAuth/NextAuth authorization, and Server Actions.
• Drive CI/CD pipelines, Kubernetes cloud deployments on AWS, and optimize Core Web Vitals performance.
• Collaborate closely with product managers, design systems teams, and developer community stakeholders.

REQUIREMENTS:
• 5+ years of software engineering experience with deep expertise in modern React, Next.js, and TypeScript.
• Strong experience with relational databases (PostgreSQL), ORMs (Prisma), and distributed systems design.
• Familiarity with Server Actions, Turbopack, and Edge Middleware in Next.js.
• Experience with cloud deployments (AWS, Docker, Kubernetes) and CI/CD pipelines.
• Passion for craft, developer experience, and clean code architecture.`;

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function ResumeMatcherForm({ applications }: ResumeMatcherFormProps) {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get("appId") || "";

  const [resumeText, setResumeText] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [selectedAppId, setSelectedAppId] = React.useState(initialAppId);

  // File states for Resume
  const [resumeFile, setResumeFile] = React.useState<{ name: string; size: number } | null>(null);
  const [isParsingResume, setIsParsingResume] = React.useState(false);
  const [resumeInputMode, setResumeInputMode] = React.useState<"upload" | "paste">("upload");
  const resumeFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // File states for Job Description
  const [jobFile, setJobFile] = React.useState<{ name: string; size: number } | null>(null);
  const [isParsingJob, setIsParsingJob] = React.useState(false);
  const [jobInputMode, setJobInputMode] = React.useState<"upload" | "paste">("paste");
  const jobFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<
    (AiMatchResponse & { id?: string; createdAt?: Date | string }) | null
  >(null);

  const handleFileUpload = async (
    file: File,
    type: "resume" | "job"
  ) => {
    const isResume = type === "resume";
    const setterLoading = isResume ? setIsParsingResume : setIsParsingJob;
    const setterText = isResume ? setResumeText : setJobDescription;
    const setterFile = isResume ? setResumeFile : setJobFile;

    setterLoading(true);
    const toastId = toast.loading(`Extracting text from ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to parse document", { id: toastId });
        return;
      }

      setterText(data.text);
      setterFile({ name: file.name, size: file.size });
      toast.success(`Successfully extracted ${data.characterCount} characters from ${file.name}!`, {
        id: toastId,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process document file.", { id: toastId });
    } finally {
      setterLoading(false);
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "resume");
    }
  };

  const handleJobFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "job");
    }
  };

  const handleFileDrop = (
    e: React.DragEvent<HTMLDivElement>,
    type: "resume" | "job"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JOB);
    setResumeFile(null);
    setJobFile(null);
    setResumeInputMode("paste");
    setJobInputMode("paste");
    toast.success("Loaded sample resume & job description!");
  };

  const handleReset = () => {
    setResumeText("");
    setJobDescription("");
    setResumeFile(null);
    setJobFile(null);
    setAnalysisResult(null);
    if (resumeFileInputRef.current) resumeFileInputRef.current.value = "";
    if (jobFileInputRef.current) jobFileInputRef.current.value = "";
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resumeText.trim().length < 50) {
      toast.error("Please upload or paste your resume (at least 50 characters).");
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast.error("Please upload or paste the job description (at least 50 characters).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await analyzeResumeWithAI({
        resumeText: resumeText.trim(),
        jobDescription: jobDescription.trim(),
        applicationId: selectedAppId || undefined,
      });

      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
        toast.success(`Analysis complete! Match score: ${res.analysis.matchScore}%`);
      } else {
        toast.error(res.error || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during AI analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Header Card */}
      <Card className="border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI Resume vs. Job Description Matcher
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Upload your resume file (PDF, Word, TXT) or paste text, and match against any job description file or posting with Gemini AI.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                className="gap-1.5 text-xs bg-white dark:bg-slate-900"
              >
                <Wand2 className="h-3.5 w-3.5 text-purple-500" />
                <span>Load Sample Data</span>
              </Button>
              {(resumeText || jobDescription || analysisResult || resumeFile || jobFile) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inputs Form */}
      <form onSubmit={handleAnalyze} className="space-y-6">
        {/* Optional Link to Application */}
        {applications.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Building2 className="h-4 w-4 text-indigo-500" />
              <span>Link to Job Application (Optional):</span>
            </div>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="h-9 flex-1 max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">-- No specific application link --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} — {app.role}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dual Input Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================= RESUME PANEL ================= */}
          <Card className="border-slate-200/80 dark:border-slate-800 flex flex-col shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Candidate Resume
                  </CardTitle>
                </div>

                {/* Switcher tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setResumeInputMode("upload")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      resumeInputMode === "upload"
                        ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeInputMode("paste")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      resumeInputMode === "paste"
                        ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>
              <CardDescription>
                Upload your resume in PDF, DOCX, or TXT format, or paste your text.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pt-4 space-y-3">
              {/* Hidden File Input */}
              <input
                ref={resumeFileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                onChange={handleResumeFileChange}
                className="hidden"
              />

              {/* Upload Dropzone */}
              {resumeInputMode === "upload" && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => handleFileDrop(e, "resume")}
                  onClick={() => resumeFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
                    isParsingResume
                      ? "border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20"
                      : resumeFile
                      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/20 dark:bg-slate-900/40"
                  }`}
                >
                  {isParsingResume ? (
                    <>
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Extracting resume content...
                      </p>
                      <p className="text-[11px] text-slate-400">Parsing document structure</p>
                    </>
                  ) : resumeFile ? (
                    <div className="w-full flex items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <FileType className="h-5 w-5" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {resumeFile.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <Check className="h-3 w-3" /> Extracted • {formatBytes(resumeFile.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resumeFileInputRef.current?.click();
                          }}
                          className="h-7 px-2 text-[11px] text-indigo-600 dark:text-indigo-400"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setResumeFile(null);
                            setResumeText("");
                            if (resumeFileInputRef.current) resumeFileInputRef.current.value = "";
                          }}
                          className="h-7 w-7 text-slate-400 hover:text-rose-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Click to upload resume or drag & drop
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports PDF, DOCX (Word), TXT, RTF (Max 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Textarea View / Edit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    {resumeInputMode === "upload" && resumeText
                      ? "Extracted Text Preview (Editable)"
                      : "Resume Content"}
                  </span>
                  <span>{resumeText.length} characters</span>
                </div>
                <Textarea
                  placeholder="Paste or edit resume text here (experience, skills, achievements)..."
                  rows={resumeInputMode === "upload" ? 8 : 12}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="font-mono text-xs leading-relaxed resize-y"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* ================= JOB DESCRIPTION PANEL ================= */}
          <Card className="border-slate-200/80 dark:border-slate-800 flex flex-col shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Target Job Description
                  </CardTitle>
                </div>

                {/* Switcher tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setJobInputMode("upload")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      jobInputMode === "upload"
                        ? "bg-white text-purple-600 shadow-xs dark:bg-slate-900 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobInputMode("paste")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      jobInputMode === "paste"
                        ? "bg-white text-purple-600 shadow-xs dark:bg-slate-900 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>
              <CardDescription>
                Upload JD file (PDF, Word, Text) or paste the posting requirements directly.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pt-4 space-y-3">
              {/* Hidden File Input */}
              <input
                ref={jobFileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                onChange={handleJobFileChange}
                className="hidden"
              />

              {/* Upload Dropzone */}
              {jobInputMode === "upload" && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => handleFileDrop(e, "job")}
                  onClick={() => jobFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
                    isParsingJob
                      ? "border-purple-400 bg-purple-50/30 dark:bg-purple-950/20"
                      : jobFile
                      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-slate-200 hover:border-purple-400 dark:border-slate-800 dark:hover:border-purple-500 bg-slate-50/50 hover:bg-purple-50/20 dark:bg-slate-900/40"
                  }`}
                >
                  {isParsingJob ? (
                    <>
                      <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        Extracting job description content...
                      </p>
                      <p className="text-[11px] text-slate-400">Parsing document structure</p>
                    </>
                  ) : jobFile ? (
                    <div className="w-full flex items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <FileType className="h-5 w-5" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {jobFile.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <Check className="h-3 w-3" /> Extracted • {formatBytes(jobFile.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            jobFileInputRef.current?.click();
                          }}
                          className="h-7 px-2 text-[11px] text-purple-600 dark:text-purple-400"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setJobFile(null);
                            setJobDescription("");
                            if (jobFileInputRef.current) jobFileInputRef.current.value = "";
                          }}
                          className="h-7 w-7 text-slate-400 hover:text-rose-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 group-hover:scale-105 transition-transform">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Click to upload job posting file or drag & drop
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports PDF, DOCX (Word), TXT, RTF (Max 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Textarea View / Edit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    {jobInputMode === "upload" && jobDescription
                      ? "Extracted Job Posting Text (Editable)"
                      : "Job Description Content"}
                  </span>
                  <span>{jobDescription.length} characters</span>
                </div>
                <Textarea
                  placeholder="Paste or edit target job posting responsibilities and requirements here..."
                  rows={jobInputMode === "upload" ? 8 : 12}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="font-mono text-xs leading-relaxed resize-y"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button Bar */}
        <div className="flex justify-center">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={isLoading || isParsingResume || isParsingJob || !resumeText.trim() || !jobDescription.trim()}
            className="w-full sm:w-auto min-w-[280px] h-12 text-base font-bold gap-2 shadow-indigo-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing Alignment with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Run AI Resume Match</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Analysis Result Presentation */}
      {analysisResult && (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Match Report & Optimization Plan
            </h3>
          </div>
          <MatchReportCard analysis={analysisResult} />
        </div>
      )}
    </div>
  );
}
