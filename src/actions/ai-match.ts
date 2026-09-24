"use server";

import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { aiMatchRequestSchema, type AiMatchResponse } from "@/lib/validations/ai";
import { revalidatePath } from "next/cache";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in.");
  }
  return session.user.id;
}

// Fallback intelligent heuristics analyzer when no API key is provided
function fallbackAnalyze(resumeText: string, jobDescription: string): AiMatchResponse {
  const cleanResume = resumeText.toLowerCase();
  const cleanJob = jobDescription.toLowerCase();

  // Extract common tech and soft skill keywords from job description
  const potentialKeywords = [
    "react", "next.js", "typescript", "javascript", "node.js", "python", "java", "sql", "postgresql",
    "docker", "kubernetes", "aws", "gcp", "azure", "graphql", "rest api", "tailwind css", "ci/cd",
    "microservices", "system design", "agile", "scrum", "leadership", "communication", "testing",
    "jest", "cypress", "prisma", "git", "collaboration", "performance optimization", "caching",
    "redis", "redis", "distributed systems", "security", "oauth", "nextauth", "state management",
    "server components", "tanstack query", "figma", "code review", "mentorship"
  ];

  const matchedSkills: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of potentialKeywords) {
    if (cleanJob.includes(kw)) {
      if (cleanResume.includes(kw)) {
        matchedSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      } else {
        missingKeywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
  }

  // Calculate score based on keyword overlap and resume length/density
  const totalRelevant = matchedSkills.length + missingKeywords.length;
  let score = 75;
  if (totalRelevant > 0) {
    score = Math.min(96, Math.max(45, Math.round((matchedSkills.length / totalRelevant) * 100)));
  }

  const defaultMissing = missingKeywords.length > 0 ? missingKeywords.slice(0, 6) : ["CI/CD Pipelines", "System Design", "Cloud Architecture (AWS/GCP)"];
  const defaultStrengths = matchedSkills.length > 0 ? matchedSkills.slice(0, 5) : ["Relevant Frontend/Fullstack Experience", "Modern Framework Knowledge", "Team Collaboration"];

  return {
    matchScore: score,
    missingKeywords: defaultMissing,
    strengths: defaultStrengths,
    improvements: [
      `Incorporate missing high-impact technical keywords like ${defaultMissing.slice(0, 2).join(" and ")} directly into your experience bullet points with quantitative outcomes.`,
      "Quantify your accomplishments (e.g. 'Improved load time by 35%', 'Scaled API to handle 10k req/sec') instead of listing only responsibilities.",
      "Tailor your summary statement to mirror the specific terminology and primary domain objectives highlighted in this job description."
    ],
    summary: `Your profile displays strong foundational overlap (${score}% alignment) with the role requirements. Addressing key missing keywords and adding metric-driven achievements will significantly elevate your interview conversion probability.`
  };
}

export async function analyzeResumeWithAI(formData: {
  resumeText: string;
  jobDescription: string;
  applicationId?: string;
}) {
  const userId = await getAuthUserId();
  const parsed = aiMatchRequestSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues?.[0]?.message || "Invalid input text.",
    };
  }

  const { resumeText, jobDescription, applicationId } = parsed.data;
  const apiKey = process.env.GEMINI_API_KEY;

  let result: AiMatchResponse;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are an expert technical recruiter and ATS (Applicant Tracking System) specialist.
Analyze the following candidate Resume against the target Job Description.

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Provide your evaluation strictly in the following JSON format without any markdown code fence wrappers or extra commentary:
{
  "matchScore": <number between 0 and 100 representing overall fit>,
  "missingKeywords": [<array of specific keywords/skills/technologies mentioned in the job description but absent from the resume, max 8 items>],
  "strengths": [<array of candidate's strongest matching qualifications, max 5 items>],
  "improvements": [<array of exactly 3 actionable, specific bullet recommendations to enhance the resume for this exact job>],
  "summary": "<a concise 2-3 sentence executive evaluation of the candidate's alignment with this position>"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text?.trim() || "";
      const cleanedJson = responseText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const parsedAiData = JSON.parse(cleanedJson);

      result = {
        matchScore: Number(parsedAiData.matchScore) || 75,
        missingKeywords: Array.isArray(parsedAiData.missingKeywords) ? parsedAiData.missingKeywords : [],
        strengths: Array.isArray(parsedAiData.strengths) ? parsedAiData.strengths : [],
        improvements: Array.isArray(parsedAiData.improvements) && parsedAiData.improvements.length === 3
          ? parsedAiData.improvements
          : [
              "Add specific domain keywords mentioned in the job description.",
              "Include quantifiable business impact metrics in your latest project descriptions.",
              "Highlight leadership and cross-functional collaboration experience.",
            ],
        summary: parsedAiData.summary || "Strong candidate alignment with room for keyword optimization.",
      };
    } catch (err) {
      console.warn("Gemini API call encountered error, falling back to heuristic matcher:", err);
      result = fallbackAnalyze(resumeText, jobDescription);
    }
  } else {
    // Graceful fallback heuristics
    result = fallbackAnalyze(resumeText, jobDescription);
  }

  try {
    // Save to Database
    const savedRecord = await prisma.resumeAnalysis.create({
      data: {
        userId,
        applicationId: applicationId && applicationId.length > 0 ? applicationId : null,
        resumeText,
        jobDescription,
        matchScore: result.matchScore,
        missingKeywords: JSON.stringify(result.missingKeywords),
        strengths: JSON.stringify(result.strengths),
        improvements: JSON.stringify(result.improvements),
        summary: result.summary,
      },
    });

    revalidatePath("/ai-match");
    if (applicationId) {
      revalidatePath(`/applications/${applicationId}`);
    }

    return {
      success: true,
      analysis: {
        ...result,
        id: savedRecord.id,
        createdAt: savedRecord.createdAt,
      },
    };
  } catch (dbError) {
    console.error("Error saving analysis to DB:", dbError);
    return {
      success: true,
      analysis: {
        ...result,
        id: "temp-" + Date.now(),
        createdAt: new Date(),
      },
    };
  }
}

export async function getPastAnalyses() {
  const userId = await getAuthUserId();
  const analyses = await prisma.resumeAnalysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      application: {
        select: { id: true, company: true, role: true },
      },
    },
  });

  return analyses.map((a) => ({
    id: a.id,
    matchScore: a.matchScore,
    missingKeywords: JSON.parse(a.missingKeywords || "[]") as string[],
    strengths: JSON.parse(a.strengths || "[]") as string[],
    improvements: JSON.parse(a.improvements || "[]") as string[],
    summary: a.summary || "",
    resumeText: a.resumeText,
    jobDescription: a.jobDescription,
    createdAt: a.createdAt,
    application: a.application,
  }));
}
