import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding JobTrackr database...");

  const demoEmail = "demo@jobtrackr.io";
  const passwordHash = await bcrypt.hash("demopassword123", 10);

  // Upsert Demo User
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      name: "Demo Candidate",
      email: demoEmail,
      passwordHash,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log(`Demo user ready: ${user.email}`);

  // Clear existing applications for clean seed
  await prisma.application.deleteMany({ where: { userId: user.id } });
  await prisma.resumeAnalysis.deleteMany({ where: { userId: user.id } });

  const seedApplications = [
    {
      company: "Stripe",
      role: "Senior Full Stack Engineer",
      jobUrl: "https://stripe.com/jobs",
      salary: "$180,000 - $210,000",
      location: "San Francisco, CA",
      locationType: "Remote",
      status: "INTERVIEW",
      priority: "HIGH",
      notes: "Completed initial recruiter phone screen and technical coding exercise. System design interview scheduled for Thursday.",
      appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      order: 0,
      contactName: "Sarah Jenkins",
      contactEmail: "sjenkins@stripe.com",
    },
    {
      company: "Airbnb",
      role: "Staff Software Engineer, Platform",
      jobUrl: "https://careers.airbnb.com",
      salary: "$215,000 - $245,000",
      location: "San Francisco, CA",
      locationType: "Remote",
      status: "OFFER",
      priority: "HIGH",
      notes: "Received formal offer letter! Negotiating base compensation and equity refreshers.",
      appliedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      order: 0,
      contactName: "Alex Rivera",
      contactEmail: "alex.r@airbnb.com",
    },
    {
      company: "Linear",
      role: "Product Engineer (Frontend/Next.js)",
      jobUrl: "https://linear.app/careers",
      salary: "$165,000 - $190,000",
      location: "San Francisco, CA",
      locationType: "Remote",
      status: "APPLIED",
      priority: "HIGH",
      notes: "Submitted tailored application with GitHub portfolio and Next.js 15 projects.",
      appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      order: 0,
    },
    {
      company: "Vercel",
      role: "Developer Experience Engineer",
      jobUrl: "https://vercel.com/careers",
      salary: "$155,000 - $185,000",
      location: "Remote, Global",
      locationType: "Remote",
      status: "INTERVIEW",
      priority: "HIGH",
      notes: "Take-home Next.js framework demo submitted with perfect scores.",
      appliedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      order: 1,
      contactName: "David Cole",
      contactEmail: "dcole@vercel.com",
    },
    {
      company: "Datadog",
      role: "Senior Cloud Infrastructure Engineer",
      jobUrl: "https://datadoghq.com/careers",
      salary: "$175,000 - $195,000",
      location: "New York, NY",
      locationType: "Hybrid",
      status: "APPLIED",
      priority: "MEDIUM",
      notes: "Referred by former colleague Mark.",
      appliedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      order: 1,
    },
    {
      company: "Figma",
      role: "Design Systems Engineer",
      jobUrl: "https://figma.com/careers",
      salary: "$185,000 - $215,000",
      location: "San Francisco, CA",
      locationType: "Remote",
      status: "WISHLIST",
      priority: "HIGH",
      notes: "Bookmarked opportunity. Preparing custom component showcase before submitting.",
      order: 0,
    },
    {
      company: "Notion",
      role: "Full Stack Engineer, Collaboration",
      jobUrl: "https://notion.so/careers",
      salary: "$170,000 - $200,000",
      location: "San Francisco, CA",
      locationType: "Hybrid",
      status: "WISHLIST",
      priority: "MEDIUM",
      notes: "Researching engineering blog on SQLite and local-first architecture.",
      order: 1,
    },
    {
      company: "Netflix",
      role: "Senior UI Engineer",
      jobUrl: "https://jobs.netflix.com",
      salary: "$230,000 - $260,000",
      location: "Los Gatos, CA",
      locationType: "On-site",
      status: "REJECTED",
      priority: "LOW",
      notes: "Selected an internal candidate. Encouraged to apply for future product positions.",
      appliedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      order: 0,
    },
  ];

  for (const app of seedApplications) {
    const created = await prisma.application.create({
      data: {
        ...app,
        userId: user.id,
      },
    });

    await prisma.statusHistory.create({
      data: {
        applicationId: created.id,
        fromStatus: "WISHLIST",
        toStatus: app.status,
        note: `Initial status recorded as ${app.status}`,
        changedAt: app.appliedDate || new Date(),
      },
    });
  }

  // Create sample Resume Analysis
  await prisma.resumeAnalysis.create({
    data: {
      userId: user.id,
      resumeText: "Senior Full Stack Engineer with 6+ years experience in React 19, Next.js 15, TypeScript, Node.js, and PostgreSQL.",
      jobDescription: "Senior Full Stack Engineer at Stripe specializing in payment interfaces, Next.js, and scalable APIs.",
      matchScore: 94,
      missingKeywords: JSON.stringify(["Kubernetes", "PCI Compliance", "Edge Caching"]),
      strengths: JSON.stringify(["React & Next.js mastery", "TypeScript strict typing", "PostgreSQL database design"]),
      improvements: JSON.stringify([
        "Highlight experience with PCI-DSS or secure payment processing workflows in your latest work experience.",
        "Add quantitative performance metrics on API latency reductions.",
        "Mention Edge Middleware and Server Actions explicitly in your summary section."
      ]),
      summary: "Exceptional candidate match with 94% alignment. Deep ecosystem overlap with modern Next.js and TypeScript requirements.",
    },
  });

  console.log("Database seeded successfully with sample applications and AI match report!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
