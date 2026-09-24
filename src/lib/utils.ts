import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return formatDate(d);
}

export const STATUS_CONFIG = {
  WISHLIST: {
    label: "Wishlist",
    color: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 dark:bg-purple-950/40",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    headerBg: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50",
    accent: "bg-purple-500",
    iconColor: "text-purple-500",
  },
  APPLIED: {
    label: "Applied",
    color: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 dark:bg-blue-950/40",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    headerBg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
    accent: "bg-blue-500",
    iconColor: "text-blue-500",
  },
  INTERVIEW: {
    label: "Interview",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 dark:bg-amber-950/40",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    headerBg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50",
    accent: "bg-amber-500",
    iconColor: "text-amber-500",
  },
  OFFER: {
    label: "Offer",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/40",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    headerBg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50",
    accent: "bg-emerald-500",
    iconColor: "text-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    color: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 dark:bg-rose-950/40",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    headerBg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50",
    accent: "bg-rose-500",
    iconColor: "text-rose-500",
  },
} as const;

export type ApplicationStatusType = keyof typeof STATUS_CONFIG;

export const KANBAN_COLUMNS: { id: ApplicationStatusType; title: string; subtitle: string }[] = [
  { id: "WISHLIST", title: "Wishlist", subtitle: "Bookmarked opportunities" },
  { id: "APPLIED", title: "Applied", subtitle: "Applications submitted" },
  { id: "INTERVIEW", title: "Interview", subtitle: "Screening & rounds" },
  { id: "OFFER", title: "Offer", subtitle: "Offers received" },
  { id: "REJECTED", title: "Rejected", subtitle: "Archived outcomes" },
];
