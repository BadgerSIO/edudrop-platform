import React from "react";
import { cn } from "@/lib/utils";

interface LinkedInIconProps {
  className?: string;
}

/**
 * Decorative LinkedIn mark; pair with visible link text or an accessible label on the parent control.
 */
export const LinkedInIcon: React.FC<LinkedInIconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("h-3.5 w-3.5 shrink-0", className)}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
};

export default LinkedInIcon;
