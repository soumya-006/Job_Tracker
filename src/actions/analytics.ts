"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardAnalytics() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const [applications, recentStatusHistories, recentAnalyses] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        statusHistory: {
          orderBy: { changedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.statusHistory.findMany({
      where: {
        application: { userId },
      },
      orderBy: { changedAt: "desc" },
      take: 6,
      include: {
        application: {
          select: { company: true, role: true },
        },
      },
    }),
    prisma.resumeAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const total = applications.length;
  const statusCounts = {
    WISHLIST: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
  };

  for (const app of applications) {
    if (app.status in statusCounts) {
      statusCounts[app.status as keyof typeof statusCounts]++;
    }
  }

  // Active pipeline: Applied + Interview + Offer
  const activePipeline = statusCounts.APPLIED + statusCounts.INTERVIEW + statusCounts.OFFER;
  
  // Submitted: all except wishlist
  const submittedCount = statusCounts.APPLIED + statusCounts.INTERVIEW + statusCounts.OFFER + statusCounts.REJECTED;
  
  // Responded: Interview + Offer + Rejected
  const respondedCount = statusCounts.INTERVIEW + statusCounts.OFFER + statusCounts.REJECTED;
  
  const responseRate = submittedCount > 0 ? Math.round((respondedCount / submittedCount) * 100) : 0;
  const interviewRate = submittedCount > 0 ? Math.round(((statusCounts.INTERVIEW + statusCounts.OFFER) / submittedCount) * 100) : 0;
  const offerRate = submittedCount > 0 ? Math.round((statusCounts.OFFER / submittedCount) * 100) : 0;

  // Calculate weekly applications for last 6 weeks
  const now = new Date();
  const weeksData: { weekLabel: string; count: number; interviews: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekLabel = i === 0 ? "This Week" : `${i}w ago`;

    const count = applications.filter((a) => {
      const d = a.appliedDate || a.createdAt;
      return d >= weekStart && d < weekEnd;
    }).length;

    const interviews = applications.filter((a) => {
      if (a.status !== "INTERVIEW" && a.status !== "OFFER") return false;
      const d = a.updatedAt;
      return d >= weekStart && d < weekEnd;
    }).length;

    weeksData.push({ weekLabel, count, interviews });
  }

  // Format status breakdown for Recharts
  const statusBreakdown = [
    { name: "Wishlist", value: statusCounts.WISHLIST, color: "#a855f7" },
    { name: "Applied", value: statusCounts.APPLIED, color: "#3b82f6" },
    { name: "Interview", value: statusCounts.INTERVIEW, color: "#f59e0b" },
    { name: "Offer", value: statusCounts.OFFER, color: "#10b981" },
    { name: "Rejected", value: statusCounts.REJECTED, color: "#f43f5e" },
  ];

  return {
    kpis: {
      total,
      activePipeline,
      submittedCount,
      responseRate,
      interviewRate,
      offerRate,
      statusCounts,
    },
    weeklyTrends: weeksData,
    statusBreakdown,
    recentApplications: applications.slice(0, 5),
    recentStatusHistories,
    recentAnalyses,
  };
}
