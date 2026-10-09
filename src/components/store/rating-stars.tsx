import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 14,
  className,
  label,
}: {
  rating: number;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={label ?? `${rating} / 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-gold/35" style={{ width: size, height: size }} strokeWidth={1.2} aria-hidden />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="fill-gold text-gold" style={{ width: size, height: size }} strokeWidth={1.2} aria-hidden />
            </span>
          </span>
        );
      })}
    </span>
  );
}
