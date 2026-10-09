"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Content plays its CSS entrance on first paint (so it never delays LCP); only elements that start
// below the fold are held back and replayed when scrolled into view.
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"pending" | "hidden" | "shown">("pending");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, state === "hidden" ? "false" : undefined] as const;
}

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      data-in-view={inView}
      style={{ "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("reveal-stagger", className)} data-in-view={inView}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("reveal-item", className)}>{children}</div>;
}
