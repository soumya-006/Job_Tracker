"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: unknown) {
  const result = registerSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues?.[0]?.message || "Invalid input data",
    };
  }

  const { name, email, password } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return {
      success: true,
      message: "Account created successfully! Please sign in.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Something went wrong creating your account. Please try again.",
    };
  }
}

export async function loginUser(formData: unknown) {
  const result = loginSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues?.[0]?.message || "Invalid email or password",
    };
  }

  const { email, password } = result.data;

  try {
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Authentication failed. Please try again." };
      }
    }
    throw error;
  }
}

export async function loginDemoUser() {
  const demoEmail = "demo@jobtrackr.io";
  const demoPassword = "demopassword123";

  // Ensure demo user exists in database
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    demoUser = await prisma.user.create({
      data: {
        name: "Demo Candidate",
        email: demoEmail,
        passwordHash,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
    });

    // Create rich seed data for Demo User
    const sampleApps = [
      {
        company: "Google",
        role: "Senior Frontend Engineer",
        jobUrl: "https://careers.google.com",
        salary: "$195,000 - $225,000",
        location: "Mountain View, CA",
        locationType: "Hybrid",
        status: "INTERVIEW",
        priority: "HIGH",
        notes: "Passed recruiter phone screen and technical coding test. System design interview next.",
        appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        order: 0,
        contactName: "Sarah Jenkins",
        contactEmail: "sjenkins@google.recruiting.com",
      },
      {
        company: "Airbnb",
        role: "Staff Software Engineer",
        jobUrl: "https://careers.airbnb.com",
        salary: "$210,000 - $240,000",
        location: "San Francisco, CA",
        locationType: "Remote",
        status: "OFFER",
        priority: "HIGH",
        notes: "Received verbal offer! Negotiating equity compensation and sign-on bonus.",
        appliedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        order: 0,
        contactName: "Alex Rivera",
        contactEmail: "alex.r@airbnb.com",
      },
      {
        company: "Stripe",
        role: "Full Stack Engineer (Payments)",
        jobUrl: "https://stripe.com/jobs",
        salary: "$175,000 - $200,000",
        location: "Seattle, WA",
        locationType: "Remote",
        status: "APPLIED",
        priority: "HIGH",
        notes: "Applied via internal referral from Dave.",
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        order: 0,
      },
      {
        company: "Linear",
        role: "Product Engineer",
        jobUrl: "https://linear.app/careers",
        salary: "$160,000 - $180,000",
        location: "San Francisco, CA",
        locationType: "Remote",
        status: "WISHLIST",
        priority: "MEDIUM",
        notes: "Polishing side project portfolio before submitting application.",
        order: 0,
      },
      {
        company: "Datadog",
        role: "Senior Cloud Solutions Engineer",
        jobUrl: "https://datadoghq.com/careers",
        salary: "$170,000 - $190,000",
        location: "New York, NY",
        locationType: "Hybrid",
        status: "APPLIED",
        priority: "MEDIUM",
        notes: "Application confirmed via Workday portal.",
        appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        order: 1,
      },
      {
        company: "Notion",
        role: "Software Engineer, Infrastructure",
        jobUrl: "https://notion.so/careers",
        salary: "$180,000 - $210,000",
        location: "San Francisco, CA",
        locationType: "Hybrid",
        status: "REJECTED",
        priority: "LOW",
        notes: "Role filled by internal transfer candidate. Encouraged to re-apply in 6 months.",
        appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        order: 0,
      },
      {
        company: "Figma",
        role: "Design Systems Engineer",
        jobUrl: "https://figma.com/careers",
        salary: "$185,000 - $215,000",
        location: "San Francisco, CA",
        locationType: "Remote",
        status: "INTERVIEW",
        priority: "HIGH",
        notes: "Take-home component design exercise submitted. Feedback was very positive.",
        appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        order: 1,
        contactName: "Maya Lin",
        contactEmail: "mlin@figma.com",
      },
    ];

    for (const app of sampleApps) {
      const createdApp = await prisma.application.create({
        data: {
          ...app,
          userId: demoUser.id,
        },
      });

      // Add status history
      await prisma.statusHistory.create({
        data: {
          applicationId: createdApp.id,
          fromStatus: "WISHLIST",
          toStatus: app.status,
          note: `Status initialized to ${app.status}`,
          changedAt: app.appliedDate || new Date(),
        },
      });
    }

    // Add a sample ResumeAnalysis
    await prisma.resumeAnalysis.create({
      data: {
        userId: demoUser.id,
        resumeText: "Experienced Full Stack Engineer with 5+ years building distributed React/Next.js applications, TypeScript, GraphQL, Node.js, and PostgreSQL.",
        jobDescription: "Looking for a Senior Full Stack Engineer with deep expertise in React 19, Next.js App Router, Tailwind CSS, TypeScript, and Server Components.",
        matchScore: 92,
        missingKeywords: JSON.stringify(["Server Actions", "Turbopack", "Edge Middleware"]),
        strengths: JSON.stringify(["Strong React & Next.js background", "TypeScript proficiency", "Database & ORM experience"]),
        improvements: JSON.stringify([
          "Highlight specific performance optimizations (e.g. Core Web Vitals, SSR caching) achieved in previous roles.",
          "Add metrics on full-stack feature delivery velocity and team mentorship.",
          "Explicitly mention Next.js App Router and React Server Components in recent project bullet points."
        ]),
        summary: "Exceptional match for full-stack frontend-focused role with strong modern React ecosystem alignment.",
      },
    });
  }

  try {
    await signIn("credentials", {
      email: demoEmail,
      password: demoPassword,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    console.error("Demo login error:", error);
    return { success: false, error: "Failed to log into demo account." };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
