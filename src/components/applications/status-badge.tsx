import React from "react";
import { STATUS_CONFIG, type ApplicationStatusType } from "@/lib/utils";
import { Sparkles, Send, CalendarCheck, Award, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

const statusIcons: Record<string, React.ReactNode> = {
  WISHLIST: <Sparkles className="h-3 w-3" />,
  APPLIED: <Send className="h-3 w-3" />,
  INTERVIEW: <CalendarCheck className="h-3 w-3" />,
  OFFER: <Award className="h-3 w-3" />,
  REJECTED: <XCircle className="h-3 w-3" />,
};

export function StatusBadge({ status, className = "", showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as ApplicationStatusType] || STATUS_CONFIG.WISHLIST;
  const icon = statusIcons[status] || statusIcons.WISHLIST;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badge} ${className}`}
    >
      {showIcon && <span className={config.iconColor}>{icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
