# 🚀 JobTrackr - Full-Stack Job Application Tracker & AI Career Suite

**JobTrackr** is a modern, high-performance web application built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**. It empowers job seekers to manage their entire career search pipeline with an interactive **drag-and-drop Kanban board**, track interview milestones, and optimize resumes with **Google Gemini AI** scoring and ATS insights.

---

## ✨ Key Features

- **🔐 Full Authentication & Route Protection**:
  - Powered by **Auth.js / NextAuth v5** with Credentials & Google OAuth providers.
  - 1-Click Instant Demo Login preloaded with rich realistic job applications and status histories.
  - Route protection via Next.js Middleware.

- **📋 Interactive Drag-and-Drop Kanban Board**:
  - 5 customizable stages: `Wishlist`, `Applied`, `Interview`, `Offer`, `Rejected`.
  - Built with `@dnd-kit` featuring optimistic UI updates and instant persistence to the database.
  - Search by company/role, filter by priority (`High`, `Medium`, `Low`), and quick-add cards.

- **🤖 AI-Powered Resume Matcher (Gemini 2.5 AI)**:
  - Paste any resume text and target job description to receive:
    - **ATS Match Score (0 - 100)** with animated gauge and confetti celebration.
    - **Missing Critical Keywords** with 1-click clipboard copy.
    - **Matching Strengths** highlighting candidate fit.
    - **3 Targeted Actionable Resume Improvements** to maximize interview callbacks.
    - **Executive Evaluation Summary**.
  - Intelligent deterministic fallback heuristic analyzer if an API key is not configured.

- **📊 Visual Analytics Dashboard (Recharts)**:
  - KPI Metrics: *Total Tracked*, *Active Pipeline*, *Response Rate %*, *Interview Rate %*, *Offer Conversion %*.
  - Weekly application velocity trend chart.
  - Pipeline stage distribution donut chart.
  - Live transition activity feed.

- **📁 Comprehensive Application Details & CRUD**:
  - Application table view with sorting (by company, applied date, salary, updated date) and stage filtering.
  - Application detail page with **Status History Timeline** logging notes and dates on every stage change.
  - Contact/Recruiter info management and notes editor.

- **🎨 Premium UI & Design System**:
  - Tailored color palette, glassmorphism cards, and gradients.
  - Dark / Light mode toggle powered by `next-themes`.
  - Toast feedback via `sonner` and animated skeletons.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 App Router (React 19, TypeScript strict mode) |
| **Styling** | Tailwind CSS + custom glassmorphic design system |
| **Database & ORM** | Prisma ORM with SQLite (local) / PostgreSQL (Neon / Supabase) |
| **Authentication** | Auth.js (NextAuth v5) + bcryptjs |
| **State & Drag-Drop**| `@dnd-kit/core`, `@dnd-kit/sortable`, TanStack Query |
| **Forms & Validation**| React Hook Form + Zod v4 schemas |
| **Charts** | Recharts (Responsive bar & donut charts) |
| **AI Integration** | Google Gemini AI (`@google/genai` with `gemini-2.5-flash`) |

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
cd job_tracker
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="jobtrackr-secure-development-secret-jwt-token-2026-key"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# Optional: Google Gemini API key for real-time AI resume matching
# (Get a free key at https://aistudio.google.com/)
GEMINI_API_KEY=""

# Optional: Google OAuth
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

### 3. Initialize the Database & Seed Sample Data
```bash
# Push Prisma schema to SQLite database
npx prisma db push

# Seed realistic demo applications and analyses
npm run seed
```

### 4. Run the Application
```bash
# Start the development server
npm run dev

# Or build and start production server
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Demo Credentials
You can log in instantly by clicking **"1-Click Demo"** on the login page, or use:
- **Email**: `demo@jobtrackr.io`
- **Password**: `demopassword123`

---

## 📂 Project Architecture

```
job_tracker/
├── prisma/
│   ├── schema.prisma         # Database schema (User, Application, StatusHistory, ResumeAnalysis)
│   └── seed.ts               # Database seed script
├── src/
│   ├── actions/              # Next.js Server Actions
│   │   ├── ai-match.ts       # Gemini AI matching & heuristic fallback
│   │   ├── analytics.ts      # Dashboard metrics & trend calculations
│   │   ├── applications.ts   # CRUD & status history server actions
│   │   └── auth.ts           # Sign in, registration & 1-click demo actions
│   ├── app/                  # Next.js App Router
│   │   ├── (dashboard)/      # Authenticated layouts & views
│   │   │   ├── ai-match/     # AI Resume Matcher page
│   │   │   ├── applications/ # Table list & [id] detail timeline
│   │   │   ├── dashboard/    # Analytics dashboard
│   │   │   └── kanban/       # Kanban board page
│   │   ├── api/auth/         # NextAuth route handler
│   │   ├── login/            # Sign in page
│   │   ├── register/         # Sign up page
│   │   ├── globals.css       # Design tokens & glassmorphism
│   │   ├── layout.tsx        # Root layout with providers
│   │   └── page.tsx          # Landing hero page
│   ├── components/
│   │   ├── ai-match/         # MatchScoreGauge, MatchReportCard, ResumeMatcherForm
│   │   ├── applications/     # ApplicationFormDialog, ApplicationListTable, StatusBadge
│   │   ├── dashboard/        # StatCards, WeeklyTrendChart, StatusPieChart, RecentActivity
│   │   ├── kanban/           # KanbanBoard, KanbanColumn, KanbanCard
│   │   ├── layout/           # Navbar, ThemeToggle, UserNav
│   │   ├── providers/        # ThemeProvider, QueryProvider
│   │   └── ui/               # Button, Input, Textarea, Dialog, Card, Badge, DropdownMenu, etc.
│   ├── lib/                  # Prisma client, auth, utilities & Zod validation schemas
│   ├── auth.ts               # NextAuth v5 setup
│   └── middleware.ts         # Route protection middleware
```

---

## 📄 License
MIT © 2026 JobTrackr.
