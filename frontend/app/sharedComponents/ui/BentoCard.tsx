import React from "react";
import { cn } from "@/lib/utils";

export interface BentoCardProps {
  children: React.ReactNode;
  variant?: "bento" | "white" | "forest" | "glass";
  className?: string;
  id?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  variant = "bento",
  className,
  id,
}) => {
  const variantClasses = {
    bento: "bg-surface-bento border border-border-subtle/60 text-text-ink shadow-bento",
    white: "bg-white border border-border-subtle text-text-ink shadow-bento",
    forest: "bg-surface-forest text-on-forest border border-white/10 shadow-bento",
    glass:
      "bg-black/45 backdrop-blur-md border border-border-glass text-white shadow-glass",
  }[variant];

  return (
    <div
      id={id}
      className={cn(
        "relative rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-300",
        variantClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

export default BentoCard;
