"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Callback = () => void;

const observerCallbacks = new WeakMap<Element, Callback>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = observerCallbacks.get(entry.target);
            if (cb) {
              cb();
              observerCallbacks.delete(entry.target);
            }
            sharedObserver?.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px -12px 0px",
      }
    );
  }
  return sharedObserver;
}

export interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

/**
 * Play-once scroll reveal wrapper. Once an element enters the viewport,
 * it settles smoothly into its static resting state and never re-animates.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delayMs = 0,
  className,
  as: Tag = "div",
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = getSharedObserver();
    if (!observer) {
      setVisible(true);
      return;
    }

    observerCallbacks.set(el, () => setVisible(true));
    observer.observe(el);

    return () => {
      observerCallbacks.delete(el);
      observer.unobserve(el);
    };
  }, []);

  return (
    <Tag
      ref={ref as any}
      style={
        delayMs > 0
          ? ({ "--reveal-delay": `${delayMs}ms` } as React.CSSProperties)
          : undefined
      }
      className={cn("reveal-item", visible && "reveal-visible", className)}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
