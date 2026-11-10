import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface DashTitleProps {
  children: ReactNode;
  className?: string;
}

const DashTitle = ({ children, className }: DashTitleProps) => {
  const c = twMerge(
    "mb-6 text-2xl sm:text-3xl font-bold tracking-tight text-text-ink",
    className
  );
  return <h1 className={c}>{children}</h1>;
};

export default DashTitle;
