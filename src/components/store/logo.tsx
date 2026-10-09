import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "font-[family-name:var(--font-cormorant)] text-[1.2rem] font-medium tracking-[0.28em] uppercase sm:text-2xl sm:tracking-[0.34em]",
          light ? "text-ivory" : "text-foreground",
        )}
      >
        Oud&nbsp;Atelier
      </span>
      <span
        className={cn(
          "mt-1 text-[0.55rem] tracking-[0.5em] uppercase",
          light ? "text-gold-light" : "text-gold-deep",
        )}
        aria-hidden
      >
        Dubai
      </span>
    </span>
  );
}
