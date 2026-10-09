import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-luxe py-12 lg:py-16" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-12 w-2/3 max-w-xl" />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
